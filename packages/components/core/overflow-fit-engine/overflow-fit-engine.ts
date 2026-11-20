import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, type Signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounce, EMPTY, fromEvent, map, merge, type Observable, switchMap, timer } from 'rxjs';
import type { KbqFlexWrap, KbqOrientation } from '../common-behaviors';

/**
 * Overflow, in device pixels, from which an item is hidden. At a fractional `devicePixelRatio` (browser zoom, display
 * scaling) the summed sizes drift from the layout by a fraction of a device pixel: computed margins, paddings and gaps
 * are not snapped to the layout grid of 1/64 device pixel, and `DOMRect` is single-precision. A container sized by its
 * content would read as overflown after every hidden item and lose them all. Half a device pixel absorbs the drift of 32
 * such lengths, while a larger overflow can already cost the item a device pixel when it is painted.
 *
 * @docs-private
 */
export const MIN_OVERFLOW_IN_DEVICE_PIXELS = 0.5;

/**
 * An item the overflow fit engine can hide: the public `KbqOverflowItem` directive and the rectangle elements of a
 * horizontal navbar both implement it.
 *
 * @docs-private
 */
export interface KbqOverflowFitItem {
    /** Element the item renders in. */
    readonly element: Element;

    /** Whether the item must stay visible whatever the overflow. */
    readonly alwaysVisible: () => boolean;

    /** Whether the item is hidden, by the engine or by whoever else. */
    readonly hidden: () => boolean;

    /** Hides the item, out of the layout flow. */
    hide(): void;

    /** Restores the item into the layout flow. */
    show(): void;
}

/**
 * The slot the engine shows once it has hidden an item, a "More" trigger: its width joins the budget the items are
 * hidden against.
 *
 * A result is expected to make itself measurable in the very pass the engine shows it in: the engine calls `show()`
 * and then reads the subject's live overflow again, so an implementation that lands its visibility only at the next
 * change detection (a plain class binding) budgets the slot as zero width.
 *
 * @docs-private
 */
export interface KbqOverflowFitResult {
    hide(): void;

    show(): void;
}

/**
 * What the engine hides items against. The public directive measures a single container; a horizontal navbar measures
 * its host against the content of every container.
 *
 * @docs-private
 */
export interface KbqOverflowFitSubject {
    /**
     * How far the laid-out content exceeds the container along the main axis, and the space each item takes there,
     * both with every item shown.
     */
    measure(): { overflow: number; sizes: ReadonlyMap<Element, number> };

    /** A live overflow check, taken after the engine has hidden items. */
    hasOverflown(): boolean;
}

/**
 * The main axis of each orientation, as the `DOMRect` and `CSSStyleDeclaration` members to read.
 *
 * @docs-private
 */
export interface KbqOverflowAxisConfig {
    size: 'width' | 'height';
    marginStart: 'marginLeft' | 'marginTop';
    marginEnd: 'marginRight' | 'marginBottom';
    paddingStart: 'paddingLeft' | 'paddingTop';
    paddingEnd: 'paddingRight' | 'paddingBottom';
    borderStart: 'borderLeftWidth' | 'borderTopWidth';
    borderEnd: 'borderRightWidth' | 'borderBottomWidth';
    gap: 'columnGap' | 'rowGap';
    isCrossAxisExceeded: (element: HTMLElement) => boolean;
    flexDirection: 'row' | 'column';
}

/**
 * The measurement and hiding core of `KbqOverflowItems`, shared with the horizontal navbar: it measures how far laid-out
 * children exceed a container along an axis and hides items, a result slot's width included in the budget, until what
 * remains fits.
 *
 * @docs-private
 */
export class KbqOverflowFitEngine {
    private readonly window: Window;

    /** Axis configuration per orientation, also the `flex-direction` the container of that orientation lays out. */
    readonly orientationConfig: Record<KbqOrientation, KbqOverflowAxisConfig> = {
        horizontal: {
            size: 'width',
            marginStart: 'marginLeft',
            marginEnd: 'marginRight',
            paddingStart: 'paddingLeft',
            paddingEnd: 'paddingRight',
            borderStart: 'borderLeftWidth',
            borderEnd: 'borderRightWidth',
            gap: 'columnGap',
            isCrossAxisExceeded: ({ clientHeight, scrollHeight }) => scrollHeight > clientHeight,
            flexDirection: 'row'
        },
        vertical: {
            size: 'height',
            marginStart: 'marginTop',
            marginEnd: 'marginBottom',
            paddingStart: 'paddingTop',
            paddingEnd: 'paddingBottom',
            borderStart: 'borderTopWidth',
            borderEnd: 'borderBottomWidth',
            gap: 'rowGap',
            isCrossAxisExceeded: ({ clientWidth, scrollWidth }) => scrollWidth > clientWidth,
            flexDirection: 'column'
        }
    } as const;

    constructor(window: Window) {
        this.window = window;
    }

    /** The overflow, in CSS pixels, from which an item counts as hidden, see `MIN_OVERFLOW_IN_DEVICE_PIXELS`. */
    deviceThreshold(): number {
        return MIN_OVERFLOW_IN_DEVICE_PIXELS / (this.window.devicePixelRatio || 1);
    }

    /**
     * Shows every item and hides the result slot: the state to measure in, before anything is hidden. Kept apart from
     * `hideOverflownItems()`, because a caller that changes an item's presentation on the way (a navbar collapses its
     * items into icons first) has to run between the two.
     */
    showAll(items: ReadonlyArray<KbqOverflowFitItem>, result?: KbqOverflowFitResult): void {
        result?.hide();

        items.forEach((item) => item.show());
    }

    /**
     * Hides items, in the order they are handed in, until what remains fits, and shows the result slot once it has
     * hidden one. The caller measures with everything shown first, see `showAll()`.
     *
     * @param items Items in the order they are given up, not necessarily the order they sit in the DOM.
     * @param subject The container the items are hidden against.
     * @param result The slot shown once an item is hidden.
     * @param wrap Whether the subject wraps, where a line that does not fit is the overflow instead.
     * @returns The hidden items, in the order they sit in the handed-in list.
     */
    hideOverflownItems(
        items: ReadonlyArray<KbqOverflowFitItem>,
        subject: KbqOverflowFitSubject,
        result?: KbqOverflowFitResult,
        wrap: KbqFlexWrap = 'nowrap'
    ): ReadonlyArray<KbqOverflowFitItem> {
        const hideable = items.filter((item) => !item.alwaysVisible());
        const threshold = this.deviceThreshold();
        let hiddenCount = 0;

        if (wrap !== 'wrap') {
            // Hides in one go what the first measurement already shows to be too much, sparing the loop below a layout
            // per item. With every item visible the items are at their smallest and the container at its largest, and
            // the result is not counted yet, so this never hides more than the loop would.
            const { overflow, sizes } = subject.measure();
            let excess = overflow;

            while (hiddenCount < hideable.length && excess >= threshold) {
                const item = hideable[hiddenCount++]!;

                excess -= sizes.get(item.element) ?? 0;
                item.hide();
            }

            if (hiddenCount) result?.show();
        }

        while (hiddenCount < hideable.length && subject.hasOverflown()) {
            hideable[hiddenCount++]!.hide();
            result?.show();
        }

        return items.filter((item) => item.hidden());
    }

    /**
     * A subject that measures a single container along an orientation.
     */
    containerSubject(container: HTMLElement, orientation: KbqOrientation, wrap: KbqFlexWrap): KbqOverflowFitSubject {
        return {
            measure: () => this.measureContainer(container, orientation),
            hasOverflown: () => this.hasContainerOverflown(container, orientation, wrap)
        };
    }

    /** Whether the container overflows along the main axis, or across it when its content wraps. */
    hasContainerOverflown(container: HTMLElement, orientation: KbqOrientation, wrap: KbqFlexWrap): boolean {
        if (wrap === 'wrap') return this.orientationConfig[orientation].isCrossAxisExceeded(container);

        return this.measureContainer(container, orientation).overflow >= this.deviceThreshold();
    }

    /**
     * Measures how far the children of the container that take part in its layout exceed its content box along the
     * main axis, and the space each of them takes, its margins and one gap included.
     */
    measureContainer(
        container: HTMLElement,
        orientation: KbqOrientation
    ): { overflow: number; sizes: ReadonlyMap<Element, number> } {
        const axis = this.orientationConfig[orientation];
        const style = this.window.getComputedStyle(container);
        const size = container.getBoundingClientRect()[axis.size];
        const edges =
            this.px(style[axis.borderStart]) +
            this.px(style[axis.paddingStart]) +
            this.px(style[axis.paddingEnd]) +
            this.px(style[axis.borderEnd]);
        // Rects are measured after transforms and CSS `zoom`, computed lengths before them.
        const layoutSize = parseFloat(style[axis.size]);
        const scale = layoutSize > 0 ? size / (layoutSize + (style.boxSizing === 'border-box' ? 0 : edges)) : 1;
        const gap = this.px(style[axis.gap]) * scale;
        const sizes = new Map<Element, number>();
        // Gaps lie between the children, one fewer than there are.
        let used = -gap;

        for (const { element, style: childStyle } of this.laidOutChildren(container)) {
            const margins = this.px(childStyle[axis.marginStart]) + this.px(childStyle[axis.marginEnd]);
            const childSize = element.getBoundingClientRect()[axis.size] + margins * scale + gap;

            sizes.set(element, childSize);
            used += childSize;
        }

        return { overflow: used - (size - edges * scale), sizes };
    }

    /**
     * Children of the element that take part in its flex layout: neither `display: none` nor taken out of flow, as
     * hidden items are, with the children of a `display: contents` child in its place.
     */
    laidOutChildren(element: Element): Array<{ element: Element; style: CSSStyleDeclaration }> {
        return Array.from(element.children).flatMap((child) => {
            const style = this.window.getComputedStyle(child);

            if (style.display === 'contents') return this.laidOutChildren(child);

            if (style.display === 'none' || style.position === 'absolute' || style.position === 'fixed') return [];

            return [{ element: child, style }];
        });
    }

    private px(value: string): number {
        return parseFloat(value) || 0;
    }
}

/**
 * The recalculation triggers of an overflow engine: resizes of the element and of additional targets (a page-level
 * element such as `document.body` by default), the loading of a web font, and whatever the caller feeds in, debounced.
 * Created in an injection context.
 *
 * @docs-private
 */
export function kbqOverflowRecalculationTriggers(options: {
    /** The element whose resize recalculates, the overflow container itself. Left out when the caller feeds its own resize stream in. */
    element?: Element;
    /** Targets observed once, on top of the element and the additional ones, e.g. provided through a token. */
    targets?: readonly Element[];
    /** Targets observed on top of the element, re-observed when the signal changes. */
    additionalTargets: Signal<Element | Element[]>;
    /** The debounce of a burst of triggers, read per burst. */
    debounceTime: Signal<number>;
    /** Triggers beyond the resize and font ones, e.g. the signals the hidden set depends on. */
    extra?: Array<Observable<void>>;
}): Observable<void> {
    const resizeObserver = inject(SharedResizeObserver);
    const document = inject(DOCUMENT);
    const platform = inject(Platform);
    const destroyRef = inject(DestroyRef);

    if (!platform.isBrowser) {
        return EMPTY;
    }

    const triggers: Array<Observable<void>> = [
        ...(options.element ? [resizeObserver.observe(options.element).pipe(map(() => undefined))] : []),
        ...(options.targets ?? []).map((target) => resizeObserver.observe(target).pipe(map(() => undefined))),
        toObservable(options.additionalTargets).pipe(
            switchMap((targets) => {
                return Array.isArray(targets)
                    ? merge(...targets.map((target) => resizeObserver.observe(target)))
                    : resizeObserver.observe(targets);
            }),
            map(() => undefined)
        )
    ];

    // A web font that loads lays the items out again without resizing a container of fixed size.
    if (document.fonts) {
        triggers.push(fromEvent(document.fonts, 'loadingdone').pipe(map(() => undefined)));
    }

    return merge(...triggers, ...(options.extra ?? [])).pipe(
        // Read per emission: the constructor that builds this runs before the input is set.
        debounce(() => timer(options.debounceTime())),
        map(() => undefined),
        takeUntilDestroyed(destroyRef)
    );
}

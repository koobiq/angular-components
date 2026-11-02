import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    computed,
    contentChild,
    contentChildren,
    Directive,
    inject,
    input,
    numberAttribute,
    output,
    Renderer2,
    signal
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
    KBQ_WINDOW,
    KbqFlexDirection,
    KbqFlexWrap,
    kbqInjectNativeElement,
    KbqOrientation
} from '@koobiq/components/core';
import { debounceTime, EMPTY, fromEvent, merge, switchMap } from 'rxjs';

/**
 * Overflow, in device pixels, from which an item is hidden. At a fractional `devicePixelRatio` (browser zoom, display
 * scaling) the summed sizes drift from the layout by a fraction of a device pixel: computed margins, paddings and gaps
 * are not snapped to the layout grid of 1/64 device pixel, and `DOMRect` is single-precision. A container sized by its
 * content would read as overflown after every hidden item and lose them all. Half a device pixel absorbs the drift of 32
 * such lengths, while a larger overflow can already cost the item a device pixel when it is painted.
 */
const MIN_OVERFLOW_IN_DEVICE_PIXELS = 0.5;

/**
 * Manages the visibility of the element.
 *
 * @docs-private
 */
@Directive({
    host: {
        '[attr.aria-hidden]': 'hidden()',
        // @TODO should be refactored (#DS-3834)
        '[class.kbq-overflow-item-hidden]': 'hidden()'
    }
})
export class ElementVisibilityManager {
    private readonly renderer = inject(Renderer2);
    private readonly hiddenState = signal(false);

    /**
     * @docs-private
     */
    readonly element = kbqInjectNativeElement();

    /**
     * Whether the element is hidden.
     *
     * @docs-private
     */
    readonly hidden = computed(() => this.hiddenState());

    /**
     * Hides the element.
     *
     * @docs-private
     */
    hide(): void {
        this.renderer.setStyle(this.element, 'visibility', 'hidden');
        this.renderer.setStyle(this.element, 'position', 'absolute');
        this.hiddenState.set(true);
    }

    /**
     * Shows the element.
     *
     * @docs-private
     */
    show(): void {
        this.renderer.removeStyle(this.element, 'visibility');
        this.renderer.removeStyle(this.element, 'position');
        this.hiddenState.set(false);
    }
}

/**
 * Directive for displaying the result of hidden items by the `KbqOverflowItems` directive.
 */
@Directive({
    selector: '[kbqOverflowItemsResult]',
    exportAs: 'kbqOverflowItemsResult',
    host: { class: 'kbq-overflow-items-result' }
})
export class KbqOverflowItemsResult extends ElementVisibilityManager {}

/**
 * Directive for the item that can be hidden by the `KbqOverflowItems` directive.
 */
@Directive({
    selector: '[kbqOverflowItem]',
    exportAs: 'kbqOverflowItem',
    host: {
        class: 'kbq-overflow-item',
        '[class.kbq-overflow-item_always-visible]': 'alwaysVisible()'
    }
})
export class KbqOverflowItem extends ElementVisibilityManager {
    /**
     * Unique identifier for the item.
     */
    readonly id = input.required({ alias: 'kbqOverflowItem' });
    /**
     * Defines the order in which the item is processed in the overflow container,
     * without changing its original position in the `QueryList`.
     */
    readonly order = input(null, { transform: numberAttribute });
    /**
     * Element with this attribute will be ignored when hiding and will always remain visible.
     * @default false
     */
    readonly alwaysVisible = input(false, { transform: booleanAttribute });

    /**
     * @docs-private
     */
    override hide(): void {
        if (this.alwaysVisible()) return;

        super.hide();
    }
}

/**
 * Directive for managing the visibility of items that overflow the container.
 */
@Directive({
    selector: '[kbqOverflowItems]',
    exportAs: 'kbqOverflowItems',
    host: { class: 'kbq-overflow-items' }
})
export class KbqOverflowItems {
    private readonly element = kbqInjectNativeElement();
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly renderer = inject(Renderer2);
    private readonly document = inject(DOCUMENT);
    private readonly window = inject(KBQ_WINDOW);
    private readonly platform = inject(Platform);

    /**
     * `KbqOverflowItem` directive references.
     */
    private readonly items = contentChildren(KbqOverflowItem);

    /**
     * `KbqOverflowItemsResult` directive reference.
     */
    private readonly result = contentChild(KbqOverflowItemsResult);

    /**
     * Whether the overflow order should be reversed.
     *
     * @example
     * ```
     * [0, 1, hidden, hidden] ---> [hidden, hidden, 2, 3]
     * ```
     *
     * @default false
     */
    readonly reverseOverflowOrder = input(false, { transform: booleanAttribute });

    /**
     * Debounce time for recalculating items visibility.
     *
     * @default 0
     */
    readonly debounceTime = input(0, { transform: numberAttribute });

    /**
     * List of additional elements to observe for resize changes.
     *
     * @default document.body
     */
    readonly additionalResizeObserverTargets = input<Element | Element[]>(this.document.body);

    /**
     * Emits the set of hidden items after every recalculation, also when it has not changed: a recalculation shows every
     * item before it hides the overflown ones again, so a consumer that hides items itself re-applies that here.
     */
    readonly changes = output<ReadonlySet<unknown>>();

    /**
     * Set of hidden item IDs.
     */
    readonly hiddenItemIDs = toSignal(outputToObservable(this.changes), {
        initialValue: new Set<unknown>([]) as ReadonlySet<unknown>
    });

    /**
     * Defines the orientation of the overflow items.
     *
     * @default 'horizontal'
     */
    readonly orientation = input<KbqOrientation>('horizontal');

    /**
     * Defines the wrap of the overflow items.
     *
     * @default 'nowrap'
     */
    readonly wrap = input<KbqFlexWrap>('nowrap');

    /** The main axis of each orientation, as the `DOMRect` and `CSSStyleDeclaration` members to read. */
    private readonly orientationConfig: Record<
        KbqOrientation,
        {
            size: 'width' | 'height';
            marginStart: 'marginLeft' | 'marginTop';
            marginEnd: 'marginRight' | 'marginBottom';
            paddingStart: 'paddingLeft' | 'paddingTop';
            paddingEnd: 'paddingRight' | 'paddingBottom';
            borderStart: 'borderLeftWidth' | 'borderTopWidth';
            borderEnd: 'borderRightWidth' | 'borderBottomWidth';
            gap: 'columnGap' | 'rowGap';
            isCrossAxisExceeded: (element: HTMLElement) => boolean;
            flexDirection: KbqFlexDirection;
        }
    > = {
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

    constructor() {
        this.setStyles();
        this.setupObservers();
    }

    private setupObservers(): void {
        if (!this.platform.isBrowser) return;

        const resizeObservers = merge(
            this.resizeObserver.observe(this.element),
            toObservable(this.additionalResizeObserverTargets).pipe(
                switchMap((targets) => {
                    return Array.isArray(targets)
                        ? merge(...targets.map((target) => this.resizeObserver.observe(target)))
                        : this.resizeObserver.observe(targets);
                })
            )
        );

        // What the hidden set depends on besides the geometry.
        const inputs = computed(() => [
            this.items().map((item) => [item.order(), item.alwaysVisible()]),
            this.result(),
            this.reverseOverflowOrder(),
            this.orientation(),
            this.wrap()
        ]);

        // A web font that loads lays the items out again without resizing a container of fixed size.
        const fontsLoaded = this.document.fonts ? fromEvent(this.document.fonts, 'loadingdone') : EMPTY;

        merge(toObservable(inputs), resizeObservers, fontsLoaded)
            .pipe(debounceTime(this.debounceTime()), takeUntilDestroyed())
            .subscribe(() => {
                const hiddenItems = this.getHiddenItems(
                    this.sortItemsByOrder(this.items()),
                    this.reverseOverflowOrder(),
                    this.result(),
                    this.element,
                    this.orientation()
                );
                const hiddenItemIDs = new Set(hiddenItems.map(({ id }) => id()));

                this.changes.emit(hiddenItemIDs);
            });
    }

    /**
     * Sort items by their `order` attribute.
     * If an item does not have an `order` defined, its index is used as a fallback.
     */
    private sortItemsByOrder(items: ReadonlyArray<KbqOverflowItem>): ReadonlyArray<KbqOverflowItem> {
        const itemsWithOrder = Array.from(items, (item, index) => ({ item, order: item.order() ?? index }));

        return itemsWithOrder.sort((a, b) => a.order - b.order).map(({ item }) => item);
    }

    /**
     * Manages the visibility of items based on the available space in the container and returns the hidden items.
     * Direction of hiding is determined by the `reverseOverflowOrder` attribute.
     */
    private getHiddenItems(
        items: ReadonlyArray<KbqOverflowItem>,
        reverseOverflowOrder: boolean,
        result: KbqOverflowItemsResult | undefined,
        container: HTMLElement,
        orientation: KbqOrientation
    ): ReadonlyArray<KbqOverflowItem> {
        result?.hide();
        items.forEach((item) => item.show());

        const hideable = (reverseOverflowOrder ? items : [...items].reverse()).filter(
            ({ alwaysVisible }) => !alwaysVisible()
        );
        const threshold = MIN_OVERFLOW_IN_DEVICE_PIXELS / (this.window.devicePixelRatio || 1);
        let hiddenCount = 0;

        if (this.wrap() !== 'wrap') {
            // Hides in one go what the first measurement already shows to be too much, sparing the loop below a layout
            // per item. With every item visible the items are at their smallest and the container at its largest, and
            // the result is not counted yet, so this never hides more than the loop would.
            const { overflow, sizes } = this.measure(container, orientation);
            let excess = overflow;

            while (hiddenCount < hideable.length && excess >= threshold) {
                excess -= sizes.get(hideable[hiddenCount].element) ?? 0;
                hideable[hiddenCount++].hide();
            }

            if (hiddenCount) result?.show();
        }

        while (hiddenCount < hideable.length && this.hasOverflown(container, orientation, threshold)) {
            hideable[hiddenCount++].hide();
            result?.show();
        }

        return items.filter(({ hidden }) => hidden());
    }

    /**
     * This method sets the necessary styles for the directive.
     */
    private setStyles(): void {
        this.renderer.setStyle(this.element, 'position', 'relative');
        this.renderer.setStyle(this.element, 'overflow', 'hidden');
        this.renderer.setStyle(this.element, 'display', 'flex');
        this.renderer.setStyle(this.element, 'flex-grow', '1');

        toObservable(this.orientation)
            .pipe(takeUntilDestroyed())
            .subscribe((orientation) => {
                const { flexDirection } = this.orientationConfig[orientation];

                this.renderer.setStyle(this.element, 'flex-direction', flexDirection);
            });

        toObservable(this.wrap)
            .pipe(takeUntilDestroyed())
            .subscribe((wrap) => this.renderer.setStyle(this.element, 'flex-wrap', wrap));
    }

    private hasOverflown(container: HTMLElement, orientation: KbqOrientation, threshold: number): boolean {
        if (this.wrap() === 'wrap') return this.orientationConfig[orientation].isCrossAxisExceeded(container);

        return this.measure(container, orientation).overflow >= threshold;
    }

    /**
     * Measures how far the children of the container that take part in its layout exceed its content box along the
     * main axis, and the space each of them takes, its margins and one gap included.
     */
    private measure(
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

        for (const { element, style: childStyle } of this.getLaidOutChildren(container)) {
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
    private getLaidOutChildren(element: Element): Array<{ element: Element; style: CSSStyleDeclaration }> {
        return Array.from(element.children).flatMap((child) => {
            const style = this.window.getComputedStyle(child);

            if (style.display === 'contents') return this.getLaidOutChildren(child);

            if (style.display === 'none' || style.position === 'absolute' || style.position === 'fixed') return [];

            return [{ element: child, style }];
        });
    }

    private px(value: string): number {
        return parseFloat(value) || 0;
    }
}

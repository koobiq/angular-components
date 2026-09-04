import { ContentObserver } from '@angular/cdk/observers';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import {
    AfterViewInit,
    contentChild,
    contentChildren,
    Directive,
    ElementRef,
    inject,
    input,
    Signal,
    TemplateRef
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
    KBQ_TITLE_TEXT_REF,
    KBQ_WINDOW,
    kbqInjectNativeElement,
    KbqTitleTextRef,
    PopUpPlacements,
    PopUpTriggers
} from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { debounceTime, skip, throttleTime } from 'rxjs';

/**
 * Shows a tooltip with the full text of the host element, but only when that text is truncated —
 * i.e. it overflows horizontally, or vertically when clamped to several lines. The tooltip opens on
 * hover and on keyboard focus, and hides on blur, mouse leave, or a resize of the measured container.
 *
 * By default, the tooltip content is the trimmed `textContent` of the host. Provide explicit content
 * with `[kbq-title]="stringOrTemplateRef"`. For nested markup, mark the measured container with the
 * `#kbqTitleContainer` template reference and the text element(s) with `#kbqTitleText`; several
 * `#kbqTitleText` elements are supported and the tooltip is shown when any of them overflows.
 *
 * Host components that provide `KBQ_TITLE_TEXT_REF` (e.g. `KbqOption`) supply the text and parent
 * elements automatically, so the directive works without explicit template references.
 */
@Directive({
    selector: '[kbq-title]',
    host: {
        '(mouseenter)': 'handleElementEnter()',
        '(mouseleave)': 'hideTooltip()'
    },
    exportAs: 'kbqTitle'
})
export class KbqTitleDirective extends KbqTooltipTrigger implements AfterViewInit {
    /** Optional host component that exposes the measured text/parent elements via `KBQ_TITLE_TEXT_REF`. */
    private readonly componentInstance = inject<KbqTitleTextRef>(KBQ_TITLE_TEXT_REF, { host: true, optional: true });

    /** Host native element the directive is attached to. */
    private readonly nativeElement = kbqInjectNativeElement();

    /** SSR-safe window reference used for `getComputedStyle` reads. */
    private readonly window = inject(KBQ_WINDOW);

    /** Observes host content mutations to re-evaluate overflow and refresh the resolved tooltip content. */
    private readonly contentObserver = inject(ContentObserver);

    /**
     * Application-wide `ResizeObserver` shared by every consumer. One directive instance therefore adds no
     * listener of its own — which matters because `kbq-title` sits on every dropdown item, list option and
     * tree option — and, unlike a `window:resize` listener, it also reacts to container-only resizes
     * (splitter drag, sidebar collapse) that leave the window untouched.
     */
    private readonly resizeObserver = inject(SharedResizeObserver);

    /**
     * Optional explicit tooltip content. Accepts a `TemplateRef` (rendered as rich tooltip content) or a string.
     * When omitted (a bare `kbq-title` attribute resolves to an empty string), the directive falls back to the
     * trimmed `textContent` of the host (`viewValue`), preserving the default behavior.
     */
    readonly titleContent = input<TemplateRef<unknown> | string>('', { alias: 'kbq-title' });

    /**
     * Overrides the tooltip's hoverable default, as `KbqOptionTooltip` does. The hint spells out text that
     * the host had to truncate, so it floats over the neighbouring content — and a pointer-capturing pane
     * would swallow the clicks meant for it.
     */
    readonly ignoreTooltipPointerEvents = input<boolean>(true);

    /**
     * `kbqTrigger` is a single input alias shared by the tooltip, the popover and this directive, so a host
     * carrying both `kbq-title` and `kbqPopover` feeds one value to both. The title tooltip ignores it and
     * always behaves as hover + keyboard focus; the setter exists only so such a host keeps working.
     *
     * Unifying the alias family is a breaking change owned by the pop-up base, not a title-local fix.
     */
    set trigger(value: string) {
        super.trigger = value;
    }

    /**
     * The pop-up trigger. Always reports `PopUpTriggers.Hover`, so the title tooltip reacts to hover and
     * keyboard focus regardless of the assigned value.
     */
    get trigger(): string {
        return PopUpTriggers.Hover;
    }

    /**
     * Whether the host content is clipped and therefore needs a tooltip. Returns `true` if any measured
     * text element overflows the parent — covering multiple `#kbqTitleText` elements, the sub-pixel
     * special case, and both horizontal and vertical overflow.
     */
    get isOverflown(): boolean {
        return this.childElements.some((element) => this.isElementOverflown(element));
    }

    /**
     * Whether the text is clipped horizontally: the parent `offsetWidth` is smaller than the child `scrollWidth`.
     * @docs-private */
    protected get isHorizontalOverflown(): boolean {
        const child = this.child;

        return !!child && this.parent.offsetWidth < child.scrollWidth;
    }

    /**
     * Whether the text is clipped vertically: the parent `offsetHeight` is smaller than the child `scrollHeight`.
     * @docs-private */
    protected get isVerticalOverflown(): boolean {
        const child = this.child;

        return !!child && this.parent.offsetHeight < child.scrollHeight;
    }

    /** Trimmed `textContent` of the measured parent, used as the default tooltip content. */
    get viewValue(): string {
        return (this.parent.textContent || '').trim();
    }

    /**
     * Measured container element. Resolved as the projected `#kbqTitleContainer`, otherwise the
     * `KBQ_TITLE_TEXT_REF` host's `parentTextElement`, otherwise the host element itself. Never falsy.
     * @docs-private */
    protected get parent(): HTMLElement {
        return (
            this.parentContainer()?.nativeElement ||
            this.componentInstance?.parentTextElement?.nativeElement ||
            this.elementRef.nativeElement
        );
    }

    /**
     * First effective text element used for overflow detection (the first entry of `childElements`).
     * `undefined` only if the `#kbqTitleText` query is emptied at runtime.
     * @docs-private */
    protected get child(): HTMLElement | undefined {
        return this.childElements[0];
    }

    /** Whether the host element contains exactly one child node and that node is a text node.
     * @docs-private */
    private get hasOnlyText(): boolean {
        return (
            this.nativeElement.childNodes.length === 1 && this.nativeElement.childNodes[0].nodeType === Node.TEXT_NODE
        );
    }

    /**
     * Effective text elements used for overflow detection. Resolves to the projected `#kbqTitleText` elements,
     * otherwise falls back to the `KbqTitleTextRef` host's `textElement`, otherwise to the host element itself.
     * Always contains at least one element.
     * @docs-private */
    private get childElements(): HTMLElement[] {
        const projected = this.childContainer();

        if (projected.length) {
            return projected.map(({ nativeElement }) => nativeElement);
        }

        return [this.componentInstance?.textElement?.nativeElement ?? this.elementRef.nativeElement];
    }

    /** Resolved tooltip content: the explicit `titleContent` input when provided, otherwise the host text.
     * @docs-private */
    private get resolvedContent(): string | TemplateRef<unknown> {
        return this.titleContent() || this.viewValue;
    }

    /** Debounce/throttle interval (ms) applied to the resize and content-observer streams. */
    private readonly debounceInterval: number = 100;

    /** Projected text elements marked with the `#kbqTitleText` template reference. */
    private readonly childContainer: Signal<readonly ElementRef<HTMLElement>[]> = contentChildren('kbqTitleText', {
        descendants: true,
        read: ElementRef
    });

    /** Projected container element marked with the `#kbqTitleContainer` template reference. */
    private readonly parentContainer: Signal<ElementRef<HTMLElement> | undefined> = contentChild('kbqTitleContainer', {
        read: ElementRef
    });

    constructor() {
        super();

        // The input is otherwise read only on hover and on host mutations, neither of which a programmatic
        // rebind triggers: without this, changing `[kbq-title]` while the tooltip is open leaves the overlay
        // showing the previous text, and `disabled` keeps the verdict computed for the old content. The
        // initial value is skipped — `ngAfterViewInit` seeds the content once the queries are resolved.
        toObservable(this.titleContent)
            .pipe(skip(1), takeUntilDestroyed())
            .subscribe(() => {
                this.content = this.resolvedContent;
                this.disabled = !this.isOverflown;
            });
    }

    /**
     * Sets the initial tooltip content and wires the streams that toggle the tooltip's `disabled` state:
     * container resizes and content mutations re-evaluate overflow, and keyboard focus opens the tooltip
     * while other focus origins hide it.
     */
    ngAfterViewInit() {
        this.content = this.resolvedContent;

        // Keep the title tooltip centered on the trigger: fall back only to center-aligned placements
        // (top/bottom center horizontally; left/right center vertically), never to edge-anchored corner
        // positions. Guarded so an explicit consumer `kbqPlacementPriority` or `kbqPlacement` is respected.
        if (!this.placementPriority && this.placement === PopUpPlacements.Top) {
            this.placementPriority = [
                PopUpPlacements.Top,
                PopUpPlacements.Bottom,
                PopUpPlacements.Right,
                PopUpPlacements.Left
            ];
        }

        this.resizeObserver
            .observe(this.parent)
            .pipe(debounceTime(this.debounceInterval), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => (this.disabled = !this.isOverflown));

        this.contentObserver
            .observe(this.parent)
            .pipe(throttleTime(this.debounceInterval), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.disabled = !this.isOverflown;
                this.content = this.resolvedContent;
            });

        this.focusMonitor
            .monitor(this.elementRef)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((origin) => {
                if (origin === 'keyboard') {
                    this.handleElementEnter();
                    // `handleElementEnter()` only re-enables the tooltip. Without an explicit `show()` a
                    // keyboard user gets nothing: the trigger is locked to hover, so the base class binds no
                    // focus listener that would open it.
                    this.show();

                    return;
                }

                if (origin === null) {
                    // Stands in for the `blur` listener the base class never binds here: it binds one only for
                    // a focus trigger, and this directive reports hover unconditionally. `KbqTooltipTrigger`
                    // releases a tooltip muted by a pop-up on the same host on `mouseleave` or `blur` alone, so
                    // without this a keyboard-only user who once opened that pop-up would never see the title
                    // again — `show()` keeps returning early on the still-muted tooltip.
                    this.triggerName = 'blur';
                }

                // `disabled = true` hides an open tooltip through the base setter.
                this.hideTooltip();
            });
    }

    /** Enables the tooltip only when the content is overflown. Bound to `mouseenter` and keyboard focus.
     * @docs-private */
    protected handleElementEnter() {
        this.content = this.resolvedContent;
        this.disabled = !this.isOverflown;
    }

    /** Always disables (hides) the tooltip. Bound to `mouseleave` and non-keyboard focus changes.
     * @docs-private */
    protected hideTooltip() {
        this.disabled = true;
    }

    /**
     * Whether a single measured text element is clipped by the parent container. Both the single- and the
     * multi-element host go through this method, so a filter-bar pipe or a two-line list option gets the same
     * sub-pixel and ellipsis awareness as a plain text host.
     * @docs-private */
    private isElementOverflown(element: HTMLElement | undefined): boolean {
        if (!element) {
            return false;
        }

        const { offsetWidth, offsetHeight } = this.parent;
        const isVerticalOverflown = offsetHeight < element.scrollHeight;

        /** For special cases where the difference is a fraction of a pixel */
        if (!isVerticalOverflown && (element.scrollWidth === 0 || offsetWidth === element.scrollWidth)) {
            if (this.hasOnlyText) {
                return this.isTextWiderThanContainer(element);
            }

            return this.isWidthOverflown(
                this.parent.getBoundingClientRect().width,
                element.getBoundingClientRect().width,
                element
            );
        }

        return offsetWidth < element.scrollWidth || isVerticalOverflown;
    }

    /**
     * Compares the container against the width the text occupies when nothing clips it: a probe span
     * carrying the same text is appended to the container, both are measured, and the probe is removed
     * again. `finally` guarantees the probe never outlives the measurement — a throw between the append and
     * the read (e.g. a layout call on a detached tree) would otherwise strand it in the consumer's DOM.
     *
     * The container is measured while the probe is attached, as it has been since the sub-pixel path was
     * introduced: a shrink-to-fit container stretched by the probe must not be reported as clipping it.
     * @docs-private */
    private isTextWiderThanContainer(element: HTMLElement): boolean {
        const wrapper = this.renderer.createElement('span');

        wrapper.innerText = element.innerText;
        this.parent.appendChild(wrapper);

        try {
            return this.isWidthOverflown(
                this.parent.getBoundingClientRect().width,
                wrapper.getBoundingClientRect().width,
                element
            );
        } finally {
            wrapper.remove();
        }
    }

    /**
     * Compares measured widths, treating only *visible* clipping as overflow. With `text-overflow: ellipsis`
     * any positive difference counts (even a sub-pixel overflow shows `…`). With `text-overflow: clip` the
     * widths are rounded to whole CSS pixels first — mirroring the integer `offsetWidth`/`scrollWidth` path —
     * so an imperceptible sub-pixel clip is not treated as truncation.
     * @docs-private */
    private isWidthOverflown(parentWidth: number, childWidth: number, element: HTMLElement): boolean {
        return this.hasEllipsis(element) ? parentWidth < childWidth : Math.round(parentWidth) < Math.round(childWidth);
    }

    /**
     * Whether the measured text truncates with an ellipsis on either the text element or its wrapping
     * container. Only then is a sub-pixel overflow actually visible (the trailing glyph is replaced by `…`);
     * with the default `text-overflow: clip` a sub-pixel clip is imperceptible, so it must not be reported as
     * truncation. Both elements are checked because `text-overflow` is not inherited and consumers place it
     * differently: `KbqOption`/`KbqDropdownItem` style the measured text element, whereas `KbqTreeOption`
     * styles the parent container that wraps it.
     * @docs-private */
    private hasEllipsis(element: HTMLElement): boolean {
        return this.elementHasEllipsis(element) || this.elementHasEllipsis(this.parent);
    }

    /** Whether the element's computed `text-overflow` renders an ellipsis.
     * @docs-private */
    private elementHasEllipsis(element: HTMLElement): boolean {
        return this.window.getComputedStyle(element).textOverflow.includes('ellipsis');
    }
}

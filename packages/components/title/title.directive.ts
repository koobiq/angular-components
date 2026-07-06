import { ContentObserver } from '@angular/cdk/observers';
import {
    AfterViewInit,
    ContentChild,
    ContentChildren,
    Directive,
    ElementRef,
    inject,
    input,
    OnDestroy,
    QueryList,
    TemplateRef
} from '@angular/core';
import {
    KBQ_TITLE_TEXT_REF,
    KBQ_WINDOW,
    kbqInjectNativeElement,
    KbqTitleTextRef,
    PopUpPlacements,
    PopUpTriggers
} from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { Subject, Subscription, throttleTime } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/**
 * Shows a tooltip with the full text of the host element, but only when that text is truncated —
 * i.e. it overflows horizontally, or vertically when clamped to several lines. The tooltip opens on
 * hover and on keyboard focus, and hides on blur, mouse leave, or window resize.
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
        '(mouseleave)': 'hideTooltip()',
        '(window:resize)': 'resizeStream.next($event)'
    },
    exportAs: 'kbqTitle'
})
export class KbqTitleDirective extends KbqTooltipTrigger implements AfterViewInit, OnDestroy {
    /** Optional host component that exposes the measured text/parent elements via `KBQ_TITLE_TEXT_REF`. */
    private componentInstance = inject<KbqTitleTextRef>(KBQ_TITLE_TEXT_REF, { host: true, optional: true });

    /** Host native element the directive is attached to. */
    private readonly nativeElement = kbqInjectNativeElement();

    /** SSR-safe window reference used for `getComputedStyle` reads. */
    private readonly window = inject(KBQ_WINDOW);

    /** Observes host content mutations to re-evaluate overflow and refresh the resolved tooltip content. */
    private contentObserver = inject(ContentObserver);

    /**
     * Optional explicit tooltip content. Accepts a `TemplateRef` (rendered as rich tooltip content) or a string.
     * When omitted (a bare `kbq-title` attribute resolves to an empty string), the directive falls back to the
     * trimmed `textContent` of the host (`viewValue`), preserving the default behavior.
     */
    readonly titleContent = input<TemplateRef<any> | string>('', { alias: 'kbq-title' });

    // todo need rename kbqTrigger in popover, tooltip and title. Here workaround for kbq-title and popover on one button
    set trigger(value: string) {
        super.trigger = value;
    }

    /**
     * The pop-up trigger. Always reports `PopUpTriggers.Hover`, so the title tooltip reacts to hover and
     * keyboard focus regardless of the assigned value. The setter is kept only as a no-op workaround so a
     * host that also uses a popover can assign a trigger without breaking `kbq-title`.
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
        const children = this.childElements;

        /** Multiple text elements (e.g. filter-bar pipe with a name and a value): overflown if any of them overflows. */
        if (children.length > 1) {
            return children.some(
                (element) =>
                    this.parent?.offsetWidth < element.scrollWidth || this.parent?.offsetHeight < element.scrollHeight
            );
        }

        /** For special cases where the difference is a fraction of a pixel */
        if (
            !this.isVerticalOverflown &&
            (this.child.scrollWidth === 0 || this.parent?.offsetWidth === this.child.scrollWidth)
        ) {
            if (this.hasOnlyText) {
                const wrapper = this.renderer.createElement('span');

                wrapper.innerText = this.child.innerText;
                this.parent.appendChild(wrapper);

                const result = this.isWidthOverflown(
                    // eslint-disable-next-line no-restricted-properties
                    this.parent.getBoundingClientRect().width,
                    // eslint-disable-next-line no-restricted-properties
                    wrapper.getBoundingClientRect().width
                );

                wrapper.remove();

                return result;
            }

            return this.isWidthOverflown(
                // eslint-disable-next-line no-restricted-properties
                this.parent.getBoundingClientRect().width,
                // eslint-disable-next-line no-restricted-properties
                this.child.getBoundingClientRect().width
            );
        }

        return this.isHorizontalOverflown || this.isVerticalOverflown;
    }

    /** Whether the text is clipped horizontally: the parent `offsetWidth` is smaller than the child `scrollWidth`. */
    get isHorizontalOverflown(): boolean {
        return this.parent?.offsetWidth < this.child.scrollWidth;
    }

    /** Whether the text is clipped vertically: the parent `offsetHeight` is smaller than the child `scrollHeight`. */
    get isVerticalOverflown(): boolean {
        return this.parent?.offsetHeight < this.child.scrollHeight;
    }

    /**
     * Compares measured widths, treating only *visible* clipping as overflow. With `text-overflow: ellipsis`
     * any positive difference counts (even a sub-pixel overflow shows `…`). With `text-overflow: clip` the
     * widths are rounded to whole CSS pixels first — mirroring the integer `offsetWidth`/`scrollWidth` path —
     * so an imperceptible sub-pixel clip is not treated as truncation.
     * @docs-private */
    private isWidthOverflown(parentWidth: number, childWidth: number): boolean {
        return this.hasEllipsis ? parentWidth < childWidth : Math.round(parentWidth) < Math.round(childWidth);
    }

    /** Trimmed `textContent` of the measured parent, used as the default tooltip content. */
    get viewValue(): string {
        return (this.parent?.textContent || '').trim();
    }

    /**
     * Measured container element. Resolved as the projected `#kbqTitleContainer`, otherwise the
     * `KBQ_TITLE_TEXT_REF` host's `parentTextElement`, otherwise the host element itself.
     * @docs-private */
    get parent(): HTMLElement {
        return (
            this.parentContainer?.nativeElement ||
            this.componentInstance?.parentTextElement?.nativeElement ||
            this.elementRef.nativeElement
        );
    }

    /** First effective text element used for overflow detection (the first entry of `childElements`).
     * @docs-private */
    get child(): HTMLElement {
        return this.childElements[0];
    }

    /** Whether the host element contains exactly one child node and that node is a text node. */
    get hasOnlyText(): boolean {
        return (
            this.nativeElement.childNodes.length === 1 && this.nativeElement.childNodes[0].nodeType === Node.TEXT_NODE
        );
    }

    /**
     * Whether the measured text truncates with an ellipsis on either the child text element or its
     * wrapping container. Only then is a sub-pixel overflow actually visible (the trailing glyph is
     * replaced by `…`); with the default `text-overflow: clip` a sub-pixel clip is imperceptible, so
     * it must not be reported as truncation. Both elements are checked because `text-overflow` is not
     * inherited and consumers place it differently: `KbqOption`/`KbqDropdownItem` style the measured
     * `child`, whereas `KbqTreeOption` styles the `parent` container that wraps the child.
     * @docs-private */
    private get hasEllipsis(): boolean {
        return this.elementHasEllipsis(this.child) || this.elementHasEllipsis(this.parent);
    }

    /** Whether the element's computed `text-overflow` renders an ellipsis.
     * @docs-private */
    private elementHasEllipsis(element: HTMLElement): boolean {
        return this.window.getComputedStyle(element).textOverflow.includes('ellipsis');
    }

    /**
     * Effective text elements used for overflow detection. Resolves to the projected `#kbqTitleText` elements,
     * otherwise falls back to the `KbqTitleTextRef` host's `textElement`, otherwise to the host element itself.
     * Always contains at least one element.
     * @docs-private */
    private get childElements(): HTMLElement[] {
        if (this.childContainer?.length) {
            return this.childContainer.map(({ nativeElement }) => nativeElement);
        }

        return [this.componentInstance?.textElement?.nativeElement ?? this.elementRef.nativeElement];
    }

    /** Resolved tooltip content: the explicit `titleContent` input when provided, otherwise the host text.
     * @docs-private */
    private get resolvedContent(): string | TemplateRef<any> {
        return this.titleContent() || this.viewValue;
    }

    /** Emits `window:resize` events; subscribed to re-evaluate overflow after the viewport changes.
     * @docs-private */
    readonly resizeStream = new Subject<Event>();

    /** Debounce/throttle interval (ms) applied to the resize and content-observer streams. */
    private readonly debounceInterval: number = 100;

    /** Subscription to `resizeStream`, torn down in `ngOnDestroy`. */
    private resizeSubscription = Subscription.EMPTY;
    /** Subscription to the content observer, torn down in `ngOnDestroy`. */
    private contentObserverSubscription = Subscription.EMPTY;
    /** Subscription to the focus monitor, torn down in `ngOnDestroy`. */
    private focusMonitorSubscription = Subscription.EMPTY;

    /** Projected text elements marked with the `#kbqTitleText` template reference. */
    @ContentChildren('kbqTitleText', { descendants: true })
    private childContainer: QueryList<ElementRef>;

    /** Projected container element marked with the `#kbqTitleContainer` template reference. */
    @ContentChild('kbqTitleContainer')
    private parentContainer: ElementRef;

    /**
     * Sets the initial tooltip content and wires the streams that toggle the tooltip's `disabled` state:
     * window resize and content mutations re-evaluate overflow, and keyboard focus opens the tooltip
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

        this.resizeSubscription = this.resizeStream
            .pipe(debounceTime(this.debounceInterval))
            .subscribe(() => (this.disabled = !this.isOverflown));

        this.contentObserverSubscription = this.contentObserver
            .observe(this.parent)
            .pipe(throttleTime(this.debounceInterval))
            .subscribe(() => {
                this.disabled = !this.isOverflown;
                this.content = this.resolvedContent;
            });

        this.focusMonitorSubscription = this.focusMonitor
            .monitor(this.elementRef)
            .subscribe((origin) => (origin === 'keyboard' ? this.handleElementEnter() : this.hideTooltip()));
    }

    /** Unsubscribes from the resize, content-observer and focus-monitor streams and stops focus monitoring. */
    ngOnDestroy() {
        super.ngOnDestroy();

        this.resizeSubscription.unsubscribe();
        this.contentObserverSubscription.unsubscribe();
        this.focusMonitorSubscription.unsubscribe();
        this.focusMonitor.stopMonitoring(this.elementRef);
    }

    /** Enables the tooltip only when the content is overflown. Bound to `mouseenter` and keyboard focus.
     * @docs-private */
    handleElementEnter() {
        this.content = this.resolvedContent;
        this.disabled = !this.isOverflown;
    }

    /** Always disables (hides) the tooltip. Bound to `mouseleave` and non-keyboard focus changes.
     * @docs-private */
    hideTooltip() {
        this.disabled = true;
    }
}

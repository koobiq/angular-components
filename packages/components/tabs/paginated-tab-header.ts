import { FocusableOption, FocusKeyManager } from '@angular/cdk/a11y';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { ENTER, hasModifierKey, SPACE } from '@angular/cdk/keycodes';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { normalizePassiveListenerOptions, Platform } from '@angular/cdk/platform';
import {
    AfterContentChecked,
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectorRef,
    DestroyRef,
    Directive,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    NgZone,
    numberAttribute,
    OnDestroy,
    QueryList
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DOWN_ARROW, END, HOME, KBQ_WINDOW, LEFT_ARROW, RIGHT_ARROW, UP_ARROW } from '@koobiq/components/core';
import { fromEvent, merge, of as observableOf, Subject, timer } from 'rxjs';
import { auditTime, debounceTime, takeUntil } from 'rxjs/operators';

/** Config used to bind passive event listeners */
const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true }) as EventListenerOptions;

/**
 * The directions that scrolling can go in when the header's tabs exceed the header width. 'After'
 * will scroll the header towards the end of the tabs list and 'before' will scroll towards the
 * beginning of the list.
 */
export type ScrollDirection = 'after' | 'before';

/**
 * Amount of milliseconds to wait before starting to scroll the header automatically.
 * Set a little conservatively in order to handle fake events dispatched on touch devices.
 */
const HEADER_SCROLL_DELAY = 650;

/**
 * Interval in milliseconds at which to scroll the header
 * while the user is holding their pointer.
 */
const HEADER_SCROLL_INTERVAL = 100;

/** Fraction of the viewport width scrolled per arrow click/press tick. */
const SCROLL_DISTANCE = 0.8;

/** Minimum horizontal pointer movement (px) before a pointerdown is treated as a drag rather than a click. */
const DRAG_THRESHOLD = 4;

/** Below this speed (px/ms) an inertia coast stops. */
const MIN_INERTIA_VELOCITY = 0.02;

/** Clamp applied to the smoothed drag velocity so a jittery fast flick can't launch a huge coast. */
const MAX_INERTIA_VELOCITY = 3;

/** Clamp on a single inertia animation frame's elapsed time, guarding against dropped frames/backgrounded tabs. */
const MAX_FRAME_DURATION = 32;

/** Per-millisecond exponential decay rate applied to the inertia velocity. */
const FRICTION_PER_MILLISECOND = 0.003;

/** Debounce (ms) for the scroll-box `ResizeObserver`. */
const RESIZE_DEBOUNCE = 100;

/** Debounce (ms) for scroll-correction requests, so a burst of focus/selection changes settles before scrolling. */
const SCROLL_CORRECTION_DEBOUNCE = 100;

/** How often (ms) scroll/drag updates are allowed to trigger Angular change detection (arrow visibility, mask). */
const SCROLL_CD_THROTTLE = 48;

/** Applied to the scroll container while a drag gesture is in progress. */
const DRAGGING_CLASS = 'kbq-tab-header__scroll-container_dragging';

/**
 * Matches nested interactive controls (e.g. a tab's remove button) that have their own click
 * behavior and are too small to reliably press without a few stray pixels of movement — a drag
 * should never start on them, since crossing `DRAG_THRESHOLD` by accident would swallow their click.
 */
const NON_DRAGGABLE_TARGET_SELECTOR = 'button, [kbq-icon-button], input, select, textarea';

/** Tracks an in-progress mouse/pen drag gesture on the tab list. */
interface DragState {
    pointerId: number;
    didDrag: boolean;
    startX: number;
    lastX: number;
    lastTimestamp: number;
    /** Smoothed pointer velocity in px/ms, positive meaning the pointer moved right. Exponential moving average. */
    velocity: number;
}

/** Item inside a paginated tab header. */
export type KbqPaginatedTabHeaderItem = FocusableOption & { elementRef: ElementRef };

/**
 * Base class for a tab header that supported pagination.
 * @docs-private
 */
@Directive()
export abstract class KbqPaginatedTabHeader implements AfterContentChecked, AfterContentInit, AfterViewInit, OnDestroy {
    /** The index of the active tab. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: numberAttribute })
    get selectedIndex(): number {
        return this._selectedIndex;
    }

    set selectedIndex(value: number) {
        const coercedValue = coerceNumberProperty(value);

        this.selectedIndexChanged = this._selectedIndex !== coercedValue;
        this._selectedIndex = coercedValue;

        this.keyManager?.updateActiveItem(coercedValue);
    }

    private _selectedIndex = 0;

    /** Tracks which element has focus; used for keyboard navigation */
    get focusIndex(): number {
        return this.keyManager ? this.keyManager.activeItemIndex! : 0;
    }

    /** When the focus index is set, we must manually send focus to the correct label */
    set focusIndex(value: number) {
        if (!this.isValidIndex(value) || this.focusIndex === value || !this.keyManager) {
            return;
        }

        this.keyManager.setActiveItem(value);
    }

    abstract readonly items: QueryList<KbqPaginatedTabHeaderItem>;
    abstract readonly tabListContainer: ElementRef<HTMLElement>;
    abstract readonly tabList: ElementRef<HTMLElement>;
    abstract readonly nextPaginator: ElementRef<HTMLElement>;
    abstract readonly previousPaginator: ElementRef<HTMLElement>;

    /** Event emitted when the option is selected. */
    readonly selectFocusedIndex: EventEmitter<number> = new EventEmitter<number>();

    /** Event emitted when a label is focused. */
    readonly indexFocused: EventEmitter<number> = new EventEmitter<number>();

    /** Whether the controls for pagination should be displayed */
    showPaginationControls = false;

    /** Whether the tab list can be scrolled more towards the end of the tab label list. */
    disableScrollAfter = true;

    /** Whether the tab list can be scrolled more towards the beginning of the tab label list. */
    disableScrollBefore = true;

    /**
     * Whether pagination should be disabled. This can be used to avoid unnecessary
     * layout recalculations if it's known that pagination won't be required.
     */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ transform: booleanAttribute }) disablePagination: boolean = false;

    /** Whether the tabs should be displayed vertically. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    set vertical(value: boolean) {
        this._vertical = value;

        if (this._vertical) {
            this.disablePagination = true;
        }
    }

    get vertical(): boolean {
        return this._vertical;
    }

    private _vertical = false;

    /**
     * The number of tab labels that are displayed on the header. When this changes, the header
     * should re-evaluate the scroll position.
     */
    private tabLabelCount: number;

    /** Used to manage focus between the tabs. */
    private keyManager: FocusKeyManager<KbqPaginatedTabHeaderItem>;

    /** Cached text content of the header. */
    private currentTextContent: string;

    /** Stream that will stop the automated scrolling. */
    private stopScrolling = new Subject<void>();

    /** Whether the header should scroll to the selected index after the view has been checked. */
    private selectedIndexChanged = false;

    /** State of the in-progress mouse/pen drag gesture, if any. */
    private dragState: DragState | null = null;

    /** `requestAnimationFrame` handle for an in-progress inertia coast, if any. */
    private inertiaFrameId: number | null = null;

    /** Set after a drag gesture so the click it would otherwise trigger on a tab is suppressed. */
    private suppressNextClick = false;

    /** Emits on every native `scroll` event and drag/inertia frame; throttled to limit change detection. */
    private readonly scrollProgress = new Subject<void>();

    /** Emits scroll-correction requests (from focus or selection changes); debounced so a burst settles once. */
    private readonly scrollCorrectionRequest = new Subject<{ index: number; behavior: ScrollBehavior }>();

    protected readonly destroyRef = inject(DestroyRef);
    public readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly ngZone = inject(NgZone);
    private readonly platform = inject(Platform);
    private readonly dir = inject(Directionality, { optional: true });
    private readonly window = inject(KBQ_WINDOW);
    private readonly sharedResizeObserver = inject(SharedResizeObserver);

    constructor() {
        // Bind the `mouseleave` event on the outside since it doesn't change anything in the view.
        this.ngZone.runOutsideAngular(() => {
            fromEvent(this.elementRef.nativeElement, 'mouseleave')
                .pipe(takeUntilDestroyed())
                .subscribe(() => this.stopInterval());
        });
    }

    /** Called when the user has selected an item via the keyboard. */
    ngAfterViewInit() {
        // We need to handle these events manually, because we want to bind passive event listeners.
        fromEvent(this.previousPaginator.nativeElement, 'touchstart', passiveEventListenerOptions)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.handlePaginatorPress('before'));

        fromEvent(this.nextPaginator.nativeElement, 'touchstart', passiveEventListenerOptions)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.handlePaginatorPress('after'));

        this.ngZone.runOutsideAngular(() => {
            const ownerDocument = this.elementRef.nativeElement.ownerDocument;
            const container = this.tabListContainer.nativeElement;

            fromEvent(container, 'scroll', passiveEventListenerOptions)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => {
                    this.updateScrollState();
                    this.scrollProgress.next();
                });

            // Any wheel/trackpad input should immediately take over from a running inertia coast.
            fromEvent<WheelEvent>(container, 'wheel', passiveEventListenerOptions)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.cancelInertia());

            fromEvent<PointerEvent>(container, 'pointerdown')
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((event) => this.handlePointerDown(event));

            fromEvent<PointerEvent>(ownerDocument, 'pointermove')
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((event) => this.handlePointerMove(event));

            fromEvent<PointerEvent>(ownerDocument, 'pointerup')
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((event) => this.endDrag(event, true));

            fromEvent<PointerEvent>(ownerDocument, 'pointercancel')
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((event) => this.endDrag(event, false));

            fromEvent<MouseEvent>(container, 'click', { capture: true })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((event) => {
                    if (this.suppressNextClick) {
                        event.preventDefault();
                        event.stopPropagation();
                        this.suppressNextClick = false;
                    }
                });

            this.scrollProgress
                .pipe(auditTime(SCROLL_CD_THROTTLE), takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.ngZone.run(() => this.changeDetectorRef.markForCheck()));
        });

        // Covers layout changes that resize the scroll box without a `scroll` event of their own
        // (e.g. a sidebar toggling, not just the window resizing).
        this.sharedResizeObserver
            .observe(this.tabListContainer.nativeElement)
            .pipe(debounceTime(RESIZE_DEBOUNCE), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.updatePagination());

        this.scrollCorrectionRequest
            .pipe(debounceTime(SCROLL_CORRECTION_DEBOUNCE), takeUntilDestroyed(this.destroyRef))
            .subscribe(({ index, behavior }) => this.scrollCorrection(index, behavior));
    }

    ngAfterContentInit() {
        const dirChange = this.dir ? this.dir.change : observableOf('ltr');

        const realign = () => {
            this.updatePagination();
        };

        this.keyManager = new FocusKeyManager<KbqPaginatedTabHeaderItem>(this.items).withHorizontalOrientation(
            this.getLayoutDirection()
        );

        this.keyManager.updateActiveItem(this._selectedIndex);

        // Defer the first call in order to allow for slower browsers to lay out the elements.
        // This helps in cases where the user lands directly on a page with paginated tabs.
        if (typeof this.window.requestAnimationFrame !== 'undefined') {
            this.window.requestAnimationFrame(realign);
        } else {
            realign();
        }

        // On dir change or content change, realign and update the orientation of the key manager
        // if the direction has changed. Container resize is handled separately by the `ResizeObserver`.
        merge(dirChange, this.items.changes)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                // We need to defer this to give the browser some time to recalculate
                // the element dimensions. The call has to be wrapped in `NgZone.run`,
                // because the direction change handler can run outside of Angular.
                this.ngZone.run(() => Promise.resolve().then(realign));

                this.keyManager.withHorizontalOrientation(this.getLayoutDirection());
            });

        // If there is a change in the focus key manager we need to emit the `indexFocused`
        // event in order to provide a public event that notifies about focus changes. Also we realign
        // the tabs container by scrolling the new focused tab into the visible section.
        this.keyManager.change.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((newFocusIndex) => {
            this.indexFocused.emit(newFocusIndex);
            this.setTabFocus(newFocusIndex);
        });
    }

    ngAfterContentChecked(): void {
        // If the number of tab labels have changed, check if scrolling should be enabled
        if (this.tabLabelCount !== this.items.length) {
            this.updatePagination();
            this.tabLabelCount = this.items.length;
            this.changeDetectorRef.markForCheck();
        }

        // If the selected index has changed, scroll to the label.
        if (this.selectedIndexChanged) {
            this.selectedIndexChanged = false;
            this.scrollCorrectionRequest.next({ index: this._selectedIndex, behavior: 'smooth' });
            this.changeDetectorRef.markForCheck();
        }
    }

    ngOnDestroy() {
        this.cancelInertia();
        this.stopScrolling.complete();
    }

    handleKeydown(event: KeyboardEvent) {
        // We don't handle any key bindings with a modifier key.
        if (hasModifierKey(event)) {
            return;
        }

        const key = event.keyCode;

        if (key === HOME) {
            this.keyManager.setFirstItemActive();
        } else if (key === END) {
            this.keyManager.setLastItemActive();
        } else if (key === UP_ARROW && this.vertical) {
            this.keyManager.setPreviousItemActive();
        } else if (key === DOWN_ARROW && this.vertical) {
            this.keyManager.setNextItemActive();
        } else if (key === RIGHT_ARROW && !this.vertical) {
            this.keyManager.setNextItemActive();
        } else if (key === LEFT_ARROW && !this.vertical) {
            this.keyManager.setPreviousItemActive();
        } else if ([ENTER, SPACE].includes(key)) {
            this.selectFocusedIndex.emit(this.focusIndex);
        }

        if ([HOME, END, UP_ARROW, DOWN_ARROW, RIGHT_ARROW, LEFT_ARROW, SPACE, ENTER].includes(key)) {
            event.preventDefault();
        }
    }

    /**
     * Callback for when the MutationObserver detects that the content has changed.
     */
    onContentChanges() {
        const textContent = this.elementRef.nativeElement.textContent;

        // We need to diff the text content of the header, because the MutationObserver callback
        // will fire even if the text content didn't change which is inefficient and is prone
        // to infinite loops if a poorly constructed expression is passed in (see #14249).
        if (textContent !== this.currentTextContent) {
            this.currentTextContent = textContent || '';

            // The content observer runs outside the `NgZone` by default, which
            // means that we need to bring the callback back in ourselves.
            this.ngZone.run(() => {
                this.updatePagination();
                this.changeDetectorRef.markForCheck();
            });
        }
    }

    /**
     * Updates the view whether pagination should be enabled or not.
     *
     * WARNING: Calling this method can be very costly in terms of performance. It should be called
     * as infrequently as possible from outside of the Tabs component as it causes a reflow of the
     * page.
     */
    updatePagination() {
        if (!this.platform.isBrowser) return;

        this.checkPaginationEnabled();
        this.updateScrollState();
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Determines if an index is valid.  If the tabs are not ready yet, we assume that the user is
     * providing a valid index and return true.
     */
    isValidIndex(index: number): boolean {
        if (!this.items) {
            return true;
        }

        const tab = this.items ? this.items.toArray()[index] : null;

        return !!tab && !tab.disabled;
    }

    /**
     * Sets focus on the HTML element for the label wrapper and scrolls it into the view if
     * scrolling is enabled.
     */
    setTabFocus(tabIndex: number) {
        if (!this.items?.length) return;

        const item = this.items.toArray()[tabIndex];

        // Prevent the browser's own scroll-into-view behavior so the scroll-correction request
        // below is the only thing driving the scroll position.
        item.elementRef.nativeElement.focus({ preventScroll: true });

        if (this.showPaginationControls) {
            this.scrollCorrectionRequest.next({ index: tabIndex, behavior: 'auto' });
        }
    }

    /** The layout direction of the containing app. */
    getLayoutDirection(): Direction {
        return this.dir?.value === 'rtl' ? 'rtl' : 'ltr';
    }

    /**
     * Moves the tab list in the 'before' or 'after' direction (towards the beginning of the list or
     * the end of the list, respectively).
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    scrollHeader(direction: ScrollDirection) {
        const container = this.tabListContainer.nativeElement;
        const viewLength = container.clientWidth;
        const amount = (direction === 'before' ? -1 : 1) * viewLength * SCROLL_DISTANCE;

        this.scroll(this.logicalScrollPosition + amount);
    }

    /** Handles click events on the pagination arrows. */
    handlePaginatorClick(direction: ScrollDirection) {
        this.stopInterval();
        this.scrollHeader(direction);
    }

    /**
     * Evaluate whether the pagination controls should be displayed. If the scroll width of the
     * tab list is wider than the size of the header container, then the pagination controls should
     * be shown.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    checkPaginationEnabled() {
        if (this.disablePagination) {
            this.showPaginationControls = false;

            return;
        }

        const container = this.tabListContainer.nativeElement;
        const isEnabled = container.scrollWidth > container.clientWidth;

        if (!isEnabled) {
            this.cancelDrag();
            this.cancelInertia();
            container.scrollLeft = 0;
        }

        if (isEnabled !== this.showPaginationControls) {
            this.changeDetectorRef.markForCheck();
        }

        this.showPaginationControls = isEnabled;
    }

    /** Stops the currently-running paginator interval.  */
    stopInterval() {
        this.stopScrolling.next();
    }

    /**
     * Handles the user pressing down on one of the paginators.
     * Starts scrolling the header after a certain amount of time.
     * @param direction In which direction the paginator should be scrolled.
     */
    handlePaginatorPress(direction: ScrollDirection, mouseEvent?: MouseEvent) {
        // Don't start auto scrolling for right mouse button clicks. Note that we shouldn't have to
        // null check the `button`, but we do it so we don't break tests that use fake events.

        if (mouseEvent && mouseEvent.button != null && mouseEvent.button !== 0) {
            return;
        }

        // Avoid overlapping timers.
        this.stopInterval();

        // Start a timer after the delay and keep firing based on the interval.
        timer(HEADER_SCROLL_DELAY, HEADER_SCROLL_INTERVAL)
            // Keep the timer going until something tells it to stop or the component is destroyed.
            .pipe(takeUntilDestroyed(this.destroyRef), takeUntil(this.stopScrolling))
            .subscribe(() => {
                this.scrollHeader(direction);

                // Stop the timer if we've reached the start or the end.
                if (this.disableScrollBefore || this.disableScrollAfter) {
                    this.stopInterval();
                }
            });
    }

    protected abstract itemSelected(event: KeyboardEvent): void;

    /**
     * The tab list's scroll position expressed independently of reading direction: `0` at the
     * start of the tab list, growing towards the end — mirrors native `scrollLeft`'s RTL-dependent
     * sign so callers can reason about "before"/"after" without checking direction themselves.
     */
    private get logicalScrollPosition(): number {
        const scrollLeft = this.tabListContainer.nativeElement.scrollLeft;

        return this.getLayoutDirection() === 'rtl' ? -scrollLeft : scrollLeft;
    }

    /**
     * Scrolls the header to a given logical position (see {@link logicalScrollPosition}).
     * @param value Logical position to scroll to.
     * @param behavior Scroll animation behavior; `'auto'` jumps instantly, `'smooth'` animates.
     */
    private scroll(value: number, behavior: ScrollBehavior = 'smooth'): void {
        if (this.disablePagination) return;

        this.cancelInertia();

        const left = this.getLayoutDirection() === 'rtl' ? -value : value;

        this.tabListContainer.nativeElement.scrollTo({ left, behavior });
    }

    /**
     * Moves the tab list such that the desired tab label (marked by index) is moved into view.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    private scrollCorrection(labelIndex: number, behavior: ScrollBehavior = 'smooth'): void {
        if (this.disablePagination) return;

        const selectedLabel = this.items ? this.items.toArray()[labelIndex] : null;

        if (!selectedLabel) return;

        const container = this.tabListContainer.nativeElement;
        const viewLength = container.clientWidth;
        const { offsetLeft, offsetWidth } = selectedLabel.elementRef.nativeElement;

        let labelBeforePos: number;
        let labelAfterPos: number;

        if (this.getLayoutDirection() === 'ltr') {
            labelBeforePos = offsetLeft;
            labelAfterPos = labelBeforePos + (offsetWidth as number);
        } else {
            labelAfterPos = this.tabList.nativeElement.offsetWidth - offsetLeft;
            labelBeforePos = labelAfterPos - offsetWidth;
        }

        const scrollPosition = this.logicalScrollPosition;
        const beforeVisiblePos = scrollPosition;
        const afterVisiblePos = scrollPosition + viewLength;

        if (labelBeforePos < beforeVisiblePos) {
            // Overshoot by the real paginator button width, so the label isn't flush with the
            // edge the arrow overlays.
            const overscroll = this.previousPaginator.nativeElement.clientWidth || 0;

            this.scroll(labelBeforePos - overscroll, behavior);
        } else if (labelAfterPos > afterVisiblePos) {
            const overscroll = this.nextPaginator.nativeElement.clientWidth || 0;

            this.scroll(scrollPosition + (labelAfterPos - afterVisiblePos + overscroll), behavior);
        }
    }

    /**
     * Recomputes the pagination arrow-enabled state from the container's real scroll metrics.
     * Bound to the native `scroll` event — this is the sole source of truth, no imperative call
     * is needed after drag/inertia/arrow-click scroll writes.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    private updateScrollState(): void {
        if (this.disablePagination) {
            this.disableScrollAfter = this.disableScrollBefore = true;

            return;
        }

        const container = this.tabListContainer.nativeElement;

        // `Math.ceil` guards against subpixel `scrollWidth`/`clientWidth` rounding producing a
        // false "still scrollable" reading right at the end.
        this.disableScrollBefore = container.scrollLeft <= 0;
        this.disableScrollAfter = Math.ceil(container.scrollLeft + container.clientWidth) >= container.scrollWidth;
    }

    private handlePointerDown(event: PointerEvent): void {
        if (!this.platform.isBrowser || this.disablePagination || !this.showPaginationControls) return;
        // Touch keeps its existing interaction model (pagination arrows); only mouse/pen drag here.
        if (this.dragState || event.pointerType === 'touch' || event.button !== 0) return;
        // Don't hijack presses on nested controls (e.g. a tab's remove button) into a drag.
        if ((event.target as HTMLElement).closest?.(NON_DRAGGABLE_TARGET_SELECTOR)) return;

        this.cancelInertia();
        this.dragState = {
            pointerId: event.pointerId,
            didDrag: false,
            startX: event.clientX,
            lastX: event.clientX,
            lastTimestamp: event.timeStamp,
            velocity: 0
        };
    }

    private handlePointerMove(event: PointerEvent): void {
        const state = this.dragState;

        if (!state || event.pointerId !== state.pointerId) return;

        if (!state.didDrag) {
            if (Math.abs(event.clientX - state.startX) < DRAG_THRESHOLD) return;

            state.didDrag = true;
            this.tabListContainer.nativeElement.classList.add(DRAGGING_CLASS);

            try {
                this.tabListContainer.nativeElement.setPointerCapture?.(state.pointerId);
            } catch {
                // Pointer capture can fail if the pointer is no longer active — the drag still
                // works via the document-level pointermove/pointerup listeners.
            }
        }

        event.preventDefault();

        const distance = event.clientX - state.lastX;
        const elapsed = event.timeStamp - state.lastTimestamp;
        const instantVelocity = elapsed > 0 ? this.clampVelocity(-distance / elapsed) : 0;

        // Exponential moving average, not a windowed sample array — smooths out jittery per-move deltas.
        state.velocity = state.velocity === 0 ? instantVelocity : state.velocity * 0.7 + instantVelocity * 0.3;
        state.lastX = event.clientX;
        state.lastTimestamp = event.timeStamp;

        // The browser clamps this for free at the scroll bounds — no `getMaxScrollDistance()` needed.
        this.tabListContainer.nativeElement.scrollLeft -= distance;
    }

    // Aborts an in-progress drag without applying inertia, e.g. when pagination is disabled mid-gesture.
    private cancelDrag(): void {
        if (!this.dragState) return;

        this.tabListContainer.nativeElement.classList.remove(DRAGGING_CLASS);
        this.dragState = null;
    }

    // Ends a drag gesture; `applyInertia` is false for `pointercancel`, where no coast is expected.
    private endDrag(event: PointerEvent, applyInertia: boolean): void {
        const state = this.dragState;

        if (!state || event.pointerId !== state.pointerId) return;

        this.dragState = null;
        this.tabListContainer.nativeElement.classList.remove(DRAGGING_CLASS);

        if (!state.didDrag) return;

        try {
            this.tabListContainer.nativeElement.releasePointerCapture?.(state.pointerId);
        } catch {
            // Capture may already be lost, e.g. if the element was detached mid-drag.
        }

        this.suppressNextClick = true;
        // `pointercancel` never produces a trailing `click` — if it's the one that armed the
        // suppression, it would otherwise stay stuck `true` forever and eat the next unrelated
        // click. Reset unconditionally on a timer instead of only inside the click listener.
        this.window.setTimeout(() => {
            this.suppressNextClick = false;
        }, 0);

        const releaseDelay = event.timeStamp - state.lastTimestamp;
        const releaseVelocity =
            applyInertia && releaseDelay <= 80
                ? state.velocity * Math.exp(-FRICTION_PER_MILLISECOND * releaseDelay)
                : 0;

        if (Math.abs(releaseVelocity) >= MIN_INERTIA_VELOCITY) {
            this.startInertia(releaseVelocity);
        }
    }

    // Coasts the header from the release velocity, decaying it every frame — matches a natural flick.
    private startInertia(releaseVelocity: number): void {
        const container = this.tabListContainer.nativeElement;

        let velocity = releaseVelocity;
        let lastTimestamp: number | null = null;

        const step = (timestamp: number) => {
            const frameDuration = lastTimestamp === null ? 0 : Math.min(timestamp - lastTimestamp, MAX_FRAME_DURATION);

            lastTimestamp = timestamp;
            velocity *= Math.exp(-FRICTION_PER_MILLISECOND * frameDuration);

            const before = container.scrollLeft;

            container.scrollLeft += velocity * frameDuration;

            // The browser clamps `scrollLeft` at the bounds for free — an unchanged value after a
            // non-zero write means we've hit a boundary, no `getMaxScrollDistance()` needed.
            const reachedBoundary = frameDuration > 0 && container.scrollLeft === before;

            if (Math.abs(velocity) < MIN_INERTIA_VELOCITY || reachedBoundary) {
                this.inertiaFrameId = null;

                return;
            }

            this.inertiaFrameId = this.window.requestAnimationFrame(step);
        };

        this.inertiaFrameId = this.window.requestAnimationFrame(step);
    }

    // Stops an in-progress inertia coast, e.g. because a new gesture or scroll input took over.
    private cancelInertia(): void {
        if (this.inertiaFrameId === null) return;

        this.window.cancelAnimationFrame(this.inertiaFrameId);
        this.inertiaFrameId = null;
    }

    private clampVelocity(velocity: number): number {
        return Math.max(-MAX_INERTIA_VELOCITY, Math.min(MAX_INERTIA_VELOCITY, velocity));
    }
}

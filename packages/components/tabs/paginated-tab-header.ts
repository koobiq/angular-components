import { FocusableOption, FocusKeyManager } from '@angular/cdk/a11y';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { ENTER, hasModifierKey, SPACE } from '@angular/cdk/keycodes';
import { normalizePassiveListenerOptions, Platform } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
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

/** Config used to bind a non-passive `wheel` listener so `preventDefault()` can suppress page scroll. */
const activeEventListenerOptions = normalizePassiveListenerOptions({ passive: false }) as EventListenerOptions;

/**
 * The directions that scrolling can go in when the header's tabs exceed the header width. 'After'
 * will scroll the header towards the end of the tabs list and 'before' will scroll towards the
 * beginning of the list.
 */
export type ScrollDirection = 'after' | 'before';

/**
 * The distance in pixels that will be overshot when scrolling a tab label into view. This helps
 * provide a small affordance to the label next to it.
 */
const EXAGGERATED_OVERSCROLL = 60;

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

const VIEWPORT_THROTTLE_TIME = 150;
const SCROLL_DISTANCE = 0.8;

/** Minimum horizontal pointer movement (px) before a pointerdown is treated as a drag rather than a click. */
const DRAG_START_THRESHOLD = 4;

/** Rolling window (ms) of recent pointermove samples used to compute release velocity. */
const VELOCITY_SAMPLE_WINDOW = 100;

/** How far (ms) the release velocity is projected forward to land on a single inertia target. */
const INERTIA_PROJECTION_DURATION = 200;

/** How long (ms) to wait after the last wheel event before re-enabling the CSS transition. */
const WHEEL_IDLE_DEBOUNCE = 150;

/** Must match `.kbq-tab-list`'s `transition` duration in tab-header.scss/tab-nav-bar.scss. */
const LABEL_SCROLL_TRANSITION_DURATION = 500;

/** How often (ms) drag updates are allowed to trigger Angular change detection (arrow visibility). */
const DRAG_CD_THROTTLE = 48;

/** Pixel size of one wheel "line" unit (`WheelEvent.deltaMode === 1`). */
const WHEEL_LINE_SIZE = 16;

/** Applied to the scroll container while a drag gesture is in progress. */
const DRAGGING_CLASS = 'kbq-tab-header__scroll-container_dragging';

/** Applied to the tab list to suppress its CSS transition during continuous wheel/drag updates. */
const NO_TRANSITION_CLASS = 'kbq-tab-list_no-transition';

/**
 * Matches nested interactive controls (e.g. a tab's remove button) that have their own click
 * behavior and are too small to reliably press without a few stray pixels of movement — a drag
 * should never start on them, since crossing `DRAG_START_THRESHOLD` by accident would swallow their click.
 */
const NON_DRAGGABLE_TARGET_SELECTOR = 'button, [kbq-icon-button], input, select, textarea';

/** Tracks an in-progress mouse/pen drag gesture on the tab list. */
interface DragState {
    pointerId: number;
    didDrag: boolean;
    samples: { x: number; timestamp: number }[];
    cachedMaxScrollDistance: number;
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

    /** Sets the distance in pixels that the tab header should be transformed in the X-axis. */
    get scrollDistance(): number {
        return this._scrollDistance;
    }

    set scrollDistance(v: number) {
        this._scrollDistance = this.clampScrollDistance(v, this.getMaxScrollDistance());

        // Mark that the scroll distance has changed so that after the view is checked, the CSS
        // transformation can move the header.
        this.scrollDistanceChanged = true;
        this.checkScrollingControls();
    }

    /** The distance in pixels that the tab labels should be translated to the left. */
    private _scrollDistance = 0;

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

    /** Whether the scroll distance has changed and should be applied after the view is checked. */
    private scrollDistanceChanged: boolean;

    /** Used to manage focus between the tabs. */
    private keyManager: FocusKeyManager<KbqPaginatedTabHeaderItem>;

    /** Cached text content of the header. */
    private currentTextContent: string;

    /** Stream that will stop the automated scrolling. */
    private stopScrolling = new Subject<void>();

    /** Whether the header should scroll to the selected index after the view has been checked. */
    private selectedIndexChanged = false;

    /** When `scrollToLabel` last ran; used to detect a rapid burst of selection changes. */
    private lastLabelScrollTime = 0;

    /** State of the in-progress mouse/pen drag gesture, if any. */
    private dragState: DragState | null = null;

    /** Set after a drag gesture so the click it would otherwise trigger on a tab is suppressed. */
    private suppressNextClick = false;

    /** Max scroll distance cached for the current wheel "burst"; cleared when `wheelEnd` goes idle. */
    private wheelMaxScrollDistance: number | null = null;

    /** Emits on every wheel-driven scroll; debounced to know when to re-enable the CSS transition. */
    private readonly wheelEnd = new Subject<void>();

    /** Emits on every drag pointermove; throttled to limit how often change detection runs mid-drag. */
    private readonly dragProgress = new Subject<void>();

    protected readonly destroyRef = inject(DestroyRef);
    public readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly viewportRuler = inject(ViewportRuler);
    private readonly ngZone = inject(NgZone);
    private readonly platform = inject(Platform);
    private readonly dir = inject(Directionality, { optional: true });
    private readonly window = inject(KBQ_WINDOW);

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

            fromEvent<WheelEvent>(this.tabListContainer.nativeElement, 'wheel', activeEventListenerOptions)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((event) => this.handleWheel(event));

            this.wheelEnd.pipe(debounceTime(WHEEL_IDLE_DEBOUNCE), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
                this.wheelMaxScrollDistance = null;

                // Don't clear the suppression if a drag has since taken over the same class.
                if (!this.dragState) this.setTransitionSuppressed(false);
            });

            fromEvent<PointerEvent>(this.tabListContainer.nativeElement, 'pointerdown')
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

            fromEvent<MouseEvent>(this.tabListContainer.nativeElement, 'click', { capture: true })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((event) => {
                    if (this.suppressNextClick) {
                        event.preventDefault();
                        event.stopPropagation();
                        this.suppressNextClick = false;
                    }
                });

            this.dragProgress
                .pipe(auditTime(DRAG_CD_THROTTLE), takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.ngZone.run(() => this.changeDetectorRef.markForCheck()));
        });
    }

    ngAfterContentInit() {
        const dirChange = this.dir ? this.dir.change : observableOf('ltr');
        const resize = this.viewportRuler.change(VIEWPORT_THROTTLE_TIME);

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

        // On dir change or window resize, realign the ink bar and update the orientation of
        // the key manager if the direction has changed.
        merge(dirChange, resize, this.items.changes)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                // We need to defer this to give the browser some time to recalculate
                // the element dimensions. The call has to be wrapped in `NgZone.run`,
                // because the viewport change handler runs outside of Angular.
                this.ngZone.run(() =>
                    Promise.resolve().then(() => {
                        this.updateScrollPosition();
                        realign();
                    })
                );

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

        // If the selected index has changed, scroll to the label and check if the scrolling controls
        // should be disabled.
        if (this.selectedIndexChanged) {
            const now = Date.now();

            // A new target arriving before the previous jump's CSS transition could have finished
            // (e.g., tabs being added in a fast burst) would otherwise retarget it mid-flight.
            // Snap instead, and let the existing wheel idle-debounce re-enable the transition once things settle.
            if (now - this.lastLabelScrollTime < LABEL_SCROLL_TRANSITION_DURATION) {
                this.setTransitionSuppressed(true);
                this.wheelEnd.next();
            }

            this.lastLabelScrollTime = now;
            this.scrollToLabel(this._selectedIndex);
            this.checkScrollingControls();
            this.selectedIndexChanged = false;
            this.changeDetectorRef.markForCheck();
        }

        // If the scroll distance has been changed (tab selected, focused, scroll controls activated),
        // then translate the header to reflect this.
        if (this.scrollDistanceChanged) {
            this.updateTabScrollPosition();
            this.scrollDistanceChanged = false;
            this.changeDetectorRef.markForCheck();
        }
    }

    ngOnDestroy() {
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
        this.checkScrollingControls();
        this.updateTabScrollPosition();
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
        if (this.showPaginationControls) {
            this.scrollToLabel(tabIndex);
        }

        if (this.items?.length) {
            this.items.toArray()[tabIndex].focus();

            // Do not let the browser manage scrolling to focus the element, this will be handled
            // by using translation. In LTR, the scroll left should be 0. In RTL, the scroll width
            // should be the full width minus the offset width.
            const containerEl = this.tabListContainer.nativeElement;
            const dir = this.getLayoutDirection();

            if (dir === 'ltr') {
                containerEl.scrollLeft = 0;
            } else {
                containerEl.scrollLeft = containerEl.scrollWidth - containerEl.offsetWidth;
            }
        }
    }

    /** The layout direction of the containing app. */
    getLayoutDirection(): Direction {
        return this.dir?.value === 'rtl' ? 'rtl' : 'ltr';
    }

    /** Performs the CSS transformation on the tab list that will cause the list to scroll. */
    updateTabScrollPosition() {
        if (this.disablePagination) {
            return;
        }

        const scrollDistance = this.scrollDistance;
        const translateX = this.getLayoutDirection() === 'ltr' ? -scrollDistance : scrollDistance;

        // Don't use `translate3d` here because we don't want to create a new layer. A new layer
        // seems to cause flickering and overflow in Internet Explorer. For example, the ink bar
        // and ripples will exceed the boundaries of the visible tab bar.
        // See: https://github.com/angular/components/issues/10276
        // We round the `transform` here, because transforms with sub-pixel precision cause some
        // browsers to blur the content of the element.
        this.tabList.nativeElement.style.transform = `translateX(${Math.round(translateX)}px)`;

        // Setting the `transform` on IE will change the scroll offset of the parent, causing the
        // position to be thrown off in some cases. We have to reset it ourselves to ensure that
        // it doesn't get thrown off. Note that we scope it only to IE and Edge, because messing
        // with the scroll position throws off Chrome 71+ in RTL mode (see #14689).
        if (this.platform.TRIDENT || this.platform.EDGE) {
            this.tabListContainer.nativeElement.scrollLeft = 0;
        }
    }

    /**
     * Moves the tab list in the 'before' or 'after' direction (towards the beginning of the list or
     * the end of the list, respectively). The distance to scroll is computed to be a third of the
     * length of the tab list view window.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    scrollHeader(direction: ScrollDirection) {
        const viewLength = this.tabListContainer.nativeElement.offsetWidth;

        // Move the scroll distance one-third the length of the tab list's viewport.
        const scrollAmount = (direction === 'before' ? -1 : 1) * viewLength * SCROLL_DISTANCE;

        return this.scrollTo(this.scrollDistance + scrollAmount);
    }

    /** Handles click events on the pagination arrows. */
    handlePaginatorClick(direction: ScrollDirection) {
        this.stopInterval();
        this.scrollHeader(direction);
    }

    /**
     * Moves the tab list such that the desired tab label (marked by index) is moved into view.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    scrollToLabel(labelIndex: number) {
        if (this.disablePagination) {
            return;
        }

        const selectedLabel = this.items ? this.items.toArray()[labelIndex] : null;

        if (!selectedLabel) {
            return;
        }

        // The view length is the visible width of the tab labels.
        const viewLength = this.tabListContainer.nativeElement.offsetWidth;
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

        const beforeVisiblePos = this.scrollDistance;
        const afterVisiblePos = this.scrollDistance + viewLength;

        if (labelBeforePos < beforeVisiblePos) {
            // Scroll header to move label to the before direction
            this.scrollDistance -= beforeVisiblePos - labelBeforePos + EXAGGERATED_OVERSCROLL;
        } else if (labelAfterPos > afterVisiblePos) {
            // Scroll header to move label to the after direction
            this.scrollDistance += labelAfterPos - afterVisiblePos + EXAGGERATED_OVERSCROLL;
        }
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
        } else {
            const isEnabled = this.tabList.nativeElement.scrollWidth > this.elementRef.nativeElement.offsetWidth;

            if (!isEnabled) {
                this.cancelDrag();
                this.scrollDistance = 0;
            }

            if (isEnabled !== this.showPaginationControls) {
                this.changeDetectorRef.markForCheck();
            }

            this.showPaginationControls = isEnabled;
        }
    }

    /**
     * Evaluate whether the before and after controls should be enabled or disabled.
     * If the header is at the beginning of the list (scroll distance is equal to 0) then disable the
     * before button. If the header is at the end of the list (scroll distance is equal to the
     * maximum distance we can scroll), then disable the after button.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    checkScrollingControls() {
        if (this.disablePagination) {
            this.disableScrollAfter = this.disableScrollBefore = true;
        } else {
            // Check if the pagination arrows should be activated.
            this.disableScrollBefore = this.scrollDistance === 0;
            this.disableScrollAfter = this.scrollDistance === this.getMaxScrollDistance();
            this.changeDetectorRef.markForCheck();
        }
    }

    /**
     * Determines what is the maximum length in pixels that can be set for the scroll distance. This
     * is equal to the difference in width between the tab list container and tab header container.
     *
     * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
     * should be called sparingly.
     */
    getMaxScrollDistance(): number {
        const lengthOfTabList = this.tabList.nativeElement.scrollWidth;
        const viewLength = this.tabListContainer.nativeElement.offsetWidth;

        return lengthOfTabList - viewLength || 0;
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
                const { maxScrollDistance, distance } = this.scrollHeader(direction);

                // Stop the timer if we've reached the start or the end.
                if (distance === 0 || distance >= maxScrollDistance) {
                    this.stopInterval();
                }
            });
    }

    // +1 in LTR, -1 in RTL — flips a physical (screen-space) delta into scrollDistance's
    // direction-agnostic sign, matching the flip `updateTabScrollPosition` applies to `translateX`.
    private getScrollDirectionSign(): number {
        return this.getLayoutDirection() === 'ltr' ? 1 : -1;
    }

    // Handles touchpad two-finger horizontal swipe and Shift + mouse wheel.
    private handleWheel(event: WheelEvent): void {
        if (!this.platform.isBrowser || this.disablePagination || !this.showPaginationControls) return;

        let rawDelta: number;

        if (event.deltaX !== 0 && Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
            rawDelta = event.deltaX;
        } else if (event.shiftKey && event.deltaY !== 0) {
            rawDelta = event.deltaY;
        } else {
            // Plain vertical wheel (no shift), or deltaX noise during a vertical scroll — not ours to claim.
            return;
        }

        event.preventDefault();

        const delta = this.normalizeWheelDelta(event, rawDelta);

        this.setTransitionSuppressed(true);
        this.wheelEnd.next();

        this.wheelMaxScrollDistance ??= this.getMaxScrollDistance();

        // Bypass the `scrollDistance` setter here for the same reason `handlePointerMove` does — it
        // calls `checkScrollingControls()`, which forces a layout reflow, too expensive to run on
        // every wheel tick. `disableScrollBefore`/`disableScrollAfter` are updated directly below.
        this._scrollDistance = this.clampScrollDistance(
            this._scrollDistance + delta * this.getScrollDirectionSign(),
            this.wheelMaxScrollDistance
        );
        this.disableScrollBefore = this._scrollDistance === 0;
        this.disableScrollAfter = this._scrollDistance === this.wheelMaxScrollDistance;
        this.updateTabScrollPosition();
        this.dragProgress.next();
    }

    // Converts a wheel delta to pixels regardless of the browser-reported `deltaMode`.
    private normalizeWheelDelta(event: WheelEvent, delta: number): number {
        if (event.deltaMode === 1) return delta * WHEEL_LINE_SIZE;
        if (event.deltaMode === 2) return delta * this.tabListContainer.nativeElement.offsetWidth;

        return delta;
    }

    private handlePointerDown(event: PointerEvent): void {
        if (!this.platform.isBrowser || this.disablePagination || !this.showPaginationControls) return;
        // Touch keeps its existing interaction model (pagination arrows); only mouse/pen drag here.
        if (this.dragState || event.pointerType === 'touch' || event.button !== 0) return;
        // Don't hijack presses on nested controls (e.g. a tab's remove button) into a drag.
        if ((event.target as HTMLElement).closest?.(NON_DRAGGABLE_TARGET_SELECTOR)) return;

        this.dragState = {
            pointerId: event.pointerId,
            didDrag: false,
            samples: [{ x: event.clientX, timestamp: event.timeStamp }],
            cachedMaxScrollDistance: this.getMaxScrollDistance()
        };
    }

    private handlePointerMove(event: PointerEvent): void {
        const state = this.dragState;

        if (!state || event.pointerId !== state.pointerId) return;

        if (!state.didDrag) {
            if (Math.abs(event.clientX - state.samples[0].x) < DRAG_START_THRESHOLD) return;

            state.didDrag = true;
            this.setTransitionSuppressed(true);
            this.tabListContainer.nativeElement.classList.add(DRAGGING_CLASS);

            try {
                this.tabListContainer.nativeElement.setPointerCapture?.(state.pointerId);
            } catch {
                // Pointer capture can fail if the pointer is no longer active — the drag still
                // works via the document-level pointermove/pointerup listeners.
            }
        }

        event.preventDefault();

        const movedSinceLast = event.clientX - state.samples[state.samples.length - 1].x;

        state.samples.push({ x: event.clientX, timestamp: event.timeStamp });

        while (state.samples.length > 1 && event.timeStamp - state.samples[0].timestamp > VELOCITY_SAMPLE_WINDOW) {
            state.samples.shift();
        }

        // Bypass the `scrollDistance` setter here — it calls `checkScrollingControls()`, which forces
        // a layout reflow, and that's too expensive to run on every pointermove. `handleWheel` follows
        // the same cached-max-plus-direct-write pattern for the same reason.
        this._scrollDistance = this.clampScrollDistance(
            this._scrollDistance - movedSinceLast * this.getScrollDirectionSign(),
            state.cachedMaxScrollDistance
        );
        this.disableScrollBefore = this._scrollDistance === 0;
        this.disableScrollAfter = this._scrollDistance === state.cachedMaxScrollDistance;
        this.updateTabScrollPosition();
        this.dragProgress.next();
    }

    // Aborts an in-progress drag without applying inertia, e.g. when pagination is disabled mid-gesture.
    private cancelDrag(): void {
        if (!this.dragState) return;

        this.tabListContainer.nativeElement.classList.remove(DRAGGING_CLASS);
        this.setTransitionSuppressed(false);
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

        // `pointercancel` never produces a trailing `click`, so only arm the suppression for the
        // `pointerup` path that actually needs it — otherwise it can stay stuck on `true` forever.
        this.suppressNextClick = applyInertia;

        const target = applyInertia
            ? this.clampScrollDistance(
                  this._scrollDistance -
                      this.computeReleaseVelocity(state, event.timeStamp) *
                          INERTIA_PROJECTION_DURATION *
                          this.getScrollDirectionSign(),
                  state.cachedMaxScrollDistance
              )
            : this._scrollDistance;

        // Re-enable the transition before setting the target so the browser animates the coast for us
        this.setTransitionSuppressed(false);
        this.ngZone.run(() => {
            this.scrollDistance = target;
        });
    }

    // Release velocity in px/ms, positive meaning the pointer moved right.
    private computeReleaseVelocity(state: DragState, releaseTimestamp: number): number {
        const { samples } = state;

        if (samples.length < 2) return 0;

        const last = samples[samples.length - 1];

        // The pointer had already stopped moving before release — don't carry stale velocity into the coast.
        if (releaseTimestamp - last.timestamp > VELOCITY_SAMPLE_WINDOW) return 0;

        const first = samples[0];
        const dt = last.timestamp - first.timestamp;

        return dt > 0 ? (last.x - first.x) / dt : 0;
    }

    private clampScrollDistance(value: number, max: number): number {
        return Math.max(0, Math.min(max, value));
    }

    // Toggles the `.kbq-tab-list` CSS transition off during continuous wheel/drag updates.
    private setTransitionSuppressed(suppressed: boolean): void {
        this.tabList.nativeElement.classList.toggle(NO_TRANSITION_CLASS, suppressed);
    }

    protected abstract itemSelected(event: KeyboardEvent): void;

    /**
     * Scrolls the header to a given position.
     * @param position Position to which to scroll.
     * @returns Information on the current scroll distance and the maximum.
     */
    private scrollTo(position: number) {
        if (this.disablePagination) {
            return { maxScrollDistance: 0, distance: 0 };
        }

        const maxScrollDistance = this.getMaxScrollDistance();

        this.scrollDistance = this.clampScrollDistance(position, maxScrollDistance);

        // Mark that the scroll distance has changed so that after the view is checked, the CSS
        // transformation can move the header.
        this.scrollDistanceChanged = true;
        this.checkScrollingControls();

        return { maxScrollDistance, distance: this.scrollDistance };
    }

    private updateScrollPosition() {
        const maxScrollDistance = this.getMaxScrollDistance();

        if (this.scrollDistance > maxScrollDistance) {
            this.scrollTo(maxScrollDistance);
        }
    }
}

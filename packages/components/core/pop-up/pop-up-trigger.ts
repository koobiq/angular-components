import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    CdkScrollable,
    ConnectedOverlayPositionChange,
    ConnectionPositionPair,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    OverlayRef,
    ScrollDispatcher,
    ScrollStrategy
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
    ChangeDetectorRef,
    DestroyRef,
    Directive,
    ElementRef,
    EventEmitter,
    inject,
    NgZone,
    OnDestroy,
    OnInit,
    TemplateRef,
    Type,
    ViewContainerRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { distinctUntilChanged, filter, delay as rxDelay } from 'rxjs/operators';
import { ENTER, ESCAPE, SPACE } from '../keycodes';
import {
    EXTENDED_OVERLAY_POSITIONS,
    POSITION_MAP,
    POSITION_PRIORITY_STRATEGY,
    POSITION_TO_CSS_MAP
} from '../overlay/overlay-position-map';
import {
    ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT,
    KbqPopUpPlacementValues,
    KbqStickToWindowPlacementValues,
    PopUpPlacements,
    PopUpTriggers
} from './constants';
import { KbqPopUp } from './pop-up';

type KbqPopupTriggerOffset = Pick<ConnectionPositionPair, 'offsetX' | 'offsetY'>;

const getOffset = (
    { originX, overlayX, originY, overlayY }: ConnectionPositionPair,
    { width, height }: DOMRect
): KbqPopupTriggerOffset => {
    const offset: KbqPopupTriggerOffset = {};
    const elementWidthHalf = width / 2;
    const elementHeightHalf = height / 2;

    // alignment should be applied only if the element is small
    if (ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT > elementWidthHalf) {
        const PADDING = ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT - elementWidthHalf;

        if (originX === overlayX) {
            if (originX === 'start') {
                offset.offsetX = -PADDING;
            }

            if (originX === 'end') {
                offset.offsetX = PADDING;
            }
        }
    }

    // alignment should be applied only if the element is small
    if (ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT > elementHeightHalf) {
        const PADDING = ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT - elementHeightHalf;

        if (originY === overlayY) {
            if (originY === 'top') {
                offset.offsetY = -PADDING;
            }

            if (originY === 'bottom') {
                offset.offsetY = PADDING;
            }
        }
    }

    return offset;
};

/**
 * Abstract base directive for hover/focus/click-triggered pop-ups (e.g. tooltip and popover). It manages the
 * CDK overlay lifecycle, binds the trigger event listeners, resolves placement via a flexible connected position
 * strategy, and controls show/hide timing. Concrete subclasses supply the pop-up component type, its content,
 * and the overlay configuration.
 */
@Directive({
    host: {
        '(mouseenter)': 'hovered.next(true)',
        '(mouseleave)': 'hovered.next(false)'
    }
})
export abstract class KbqPopUpTrigger<T> implements OnInit, OnDestroy {
    /** Stream that emits when the popupTrigger is hovered.
     * @docs-private */
    readonly hovered = new BehaviorSubject<boolean>(false);

    /** RxJS scheduler that drives the hide timeout; `undefined` falls back to the default async scheduler.
     * @docs-private */
    protected readonly scheduler = inject(AsyncScheduler, { optional: true }) || undefined;
    /** CDK Overlay service used to create and position the pop-up overlay.
     * @docs-private */
    protected readonly overlay: Overlay = inject(Overlay);
    /** Reference to the host element the pop-up is anchored to.
     * @docs-private */
    protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    /** Angular zone, used to run the hide timer outside Angular and re-enter when hiding.
     * @docs-private */
    protected readonly ngZone: NgZone = inject(NgZone);
    /** CDK ScrollDispatcher, used to track ancestor scroll containers so the pop-up repositions on scroll.
     * @docs-private */
    protected readonly scrollDispatcher: ScrollDispatcher = inject(ScrollDispatcher);
    /** View container the pop-up component portal is attached to.
     * @docs-private */
    protected readonly hostView: ViewContainerRef = inject(ViewContainerRef);
    /** Text direction (LTR/RTL) applied to the overlay when a `Directionality` is available.
     * @docs-private */
    protected readonly direction = inject(Directionality, { optional: true });
    /** Destroy reference used to auto-unsubscribe streams when the directive is destroyed.
     * @docs-private */
    protected readonly destroyRef = inject(DestroyRef);
    /** Nearest `CdkScrollable` ancestor, if any.
     * @docs-private */
    protected readonly scrollable = inject(CdkScrollable, { optional: true });
    /** Factory returning the overlay scroll strategy; provided by the concrete subclass.
     * @docs-private */
    protected abstract scrollStrategy: () => ScrollStrategy;

    /** Optional element used to anchor and measure the pop-up instead of the host element.
     * @docs-private */
    protected externalNativeElement: HTMLElement;

    /** Change detector used to refresh the trigger when its open state changes. */
    private popUpChangeDetectorRef = inject(ChangeDetectorRef);

    /** Whether the pop-up overlay is currently open. */
    get isOpen(): boolean {
        return this._isOpen;
    }

    set isOpen(value: boolean) {
        this._isOpen = value;

        this.popUpChangeDetectorRef.markForCheck();
    }

    /** Backing field for `isOpen`. */
    private _isOpen: boolean = false;

    /** Delay in milliseconds before the pop-up is shown.
     * @docs-private */
    enterDelay: number = 0;
    /** Delay in milliseconds before the pop-up is hidden.
     * @docs-private */
    leaveDelay: number = 0;
    /** Name of the DOM event that last triggered show/hide (e.g. `mouseenter`, `focus`, `click`).
     * @docs-private */
    triggerName: string;
    /** Reference to the created overlay, or `null` when no overlay exists.
     * @docs-private */
    overlayRef: OverlayRef | null;
    /** Placement used to keep the pop-up stuck within the window bounds.
     * @docs-private */
    stickToWindow: KbqStickToWindowPlacementValues;
    /** Host container element of the pop-up.
     * @docs-private */
    container: HTMLElement;
    /** Whether the pop-up is disabled and therefore never shown; implemented by the subclass.
     * @docs-private */
    abstract disabled: boolean;
    /** Whether the arrow/pointer is rendered; implemented by the subclass.
     * @docs-private */
    abstract arrow: boolean;
    /** Space/comma-separated list of trigger events (`hover`, `focus`, `click`, `keydown`); implemented by the subclass.
     * @docs-private */
    abstract trigger: string;
    /** Extra CSS class applied to the pop-up; implemented by the subclass.
     * @docs-private */
    abstract customClass: string;
    /** Pop-up content as a string or template; implemented by the subclass.
     * @docs-private */
    abstract content: string | TemplateRef<any>;
    /** Emits when the resolved placement changes; implemented by the subclass.
     * @docs-private */
    abstract placementChange: EventEmitter<string>;
    /** Emits when the pop-up visibility changes; implemented by the subclass.
     * @docs-private */
    abstract visibleChange: EventEmitter<boolean>;
    /** CSS selector of the element used as the overlay's transform origin; implemented by the subclass.
     * @docs-private */
    protected abstract originSelector: string;
    /** Base overlay configuration (panel classes, etc.); implemented by the subclass.
     * @docs-private */
    protected abstract overlayConfig: OverlayConfig;
    /** Current resolved placement of the pop-up.
     * @docs-private */
    protected placement: KbqPopUpPlacementValues = PopUpPlacements.Top;
    /** Ordered list of fallback placements to try before the default priority.
     * @docs-private */
    protected placementPriority: string | string[] | null = null;
    /** Whether the pop-up is currently visible.
     * @docs-private */
    protected visible = false;
    /** Backing field for the subclass `content` input.
     * @docs-private */
    protected _content: string | TemplateRef<any>;
    /** Backing field for the subclass `disabled` input.
     * @docs-private */
    protected _disabled: boolean;
    /** Backing field for the subclass `customClass` input.
     * @docs-private */
    protected _customClass: string;
    /** Component portal attached to the overlay to render the pop-up.
     * @docs-private */
    protected portal: ComponentPortal<T>;
    /** Currently attached pop-up component instance, or `null` when closed.
     * @docs-private */
    protected instance: any | null;
    /** Map of event name to the handler currently bound on the host element.
     * @docs-private */
    protected listeners = new Map<string, EventListener>();
    /** Subscription to the streams that should close the pop-up.
     * @docs-private */
    protected closingActionsSubscription: Subscription;
    /** Map of placement name to its CDK connected position pair.
     * @docs-private */
    protected readonly availablePositions: { [key: string]: ConnectionPositionPair } = POSITION_MAP;
    /** Last mouse event, used to position the pop-up relative to the cursor.
     * @docs-private */
    protected mouseEvent?: MouseEvent;
    /** Flexible connected position strategy driving the overlay.
     * @docs-private */
    protected strategy: FlexibleConnectedPositionStrategy;

    /** Hide pop-up with timeout. Need if you want to show pop-up after leaving trigger
     * @docs-private */
    protected hideWithTimeout: boolean = false;

    /** prevents closure by any event
     * @docs-private */
    protected preventClose: boolean = false;

    /** Applies the placement (and modifier) CSS classes to the open pop-up; implemented by the subclass.
     * @docs-private */
    abstract updateClassMap(newPlacement?: string): void;

    /** Pushes the current inputs (content, arrow, offset, …) into the open pop-up; implemented by the subclass.
     * @docs-private */
    abstract updateData(): void;

    /** Returns the stream of events that should close the pop-up; implemented by the subclass.
     * @docs-private */
    abstract closingActions(): Observable<any>;

    /** Returns the component type to attach as the pop-up overlay; implemented by the subclass.
     * @docs-private */
    abstract getOverlayHandleComponentType(): Type<T>;

    /** Binds the DOM event listeners for the configured triggers. */
    ngOnInit(): void {
        this.initListeners();
    }

    /** Disposes the overlay and removes all bound event listeners. */
    ngOnDestroy(): void {
        this.overlayRef?.dispose();

        this.listeners.forEach(this.removeEventListener);

        this.listeners.clear();
    }

    /** Sets the placement (falling back to `Top` on an unknown value) and refreshes the classes and position.
     * @docs-private */
    updatePlacement(value: KbqPopUpPlacementValues) {
        if (POSITION_TO_CSS_MAP[value]) {
            this.placement = value;

            this.updateClassMap();
        } else {
            this.placement = PopUpPlacements.Top;

            // eslint-disable-next-line no-console
            console.warn(`Unknown position: ${value}. Will used default position: ${this.placement}`);
        }

        if (this.visible) {
            this.updatePosition();
        }
    }

    /** Sets the ordered list of fallback placements, or clears it when the value is empty.
     * @docs-private */
    updatePlacementPriority(value) {
        if (value && value.length > 0) {
            this.placementPriority = value;
        } else {
            this.placementPriority = null;
        }
    }

    /** Coerces and applies an external visibility value by showing or hiding the pop-up when it changes.
     * @docs-private */
    updateVisible(externalValue: boolean) {
        const value = coerceBooleanProperty(externalValue);

        if (this.visible !== value) {
            this.visible = value;

            if (value) {
                this.show();
            } else {
                this.hide();
            }
        }
    }

    /** Closes the pop-up when `Escape` is pressed while it is open. Bound to the host `keydown` event.
     * @docs-private */
    keydownHandler(event: KeyboardEvent) {
        if (this.isOpen && event.keyCode === ESCAPE) {
            this.hide();
        }
    }

    /** Hides the pop-up. Bound to the host `touchend` event.
     * @docs-private */
    touchendHandler() {
        this.hide();
    }

    /** Creates the overlay (if needed) and shows the pop-up after `delay` ms, wiring its visibility stream.
     * @docs-private */
    show(delay: number = this.enterDelay): void {
        if (this.disabled || this.instance) {
            return;
        }

        this.overlayRef = this.createOverlay();
        this.subscribeOnClosingActions();
        this.detach();

        this.portal = this.portal || new ComponentPortal(this.getOverlayHandleComponentType(), this.hostView);

        this.instance = this.overlayRef.attach(this.portal).instance as KbqPopUp;

        this.instance.trigger = this;

        this.instance.afterHidden().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(this.detach);

        this.updateClassMap();

        this.updateData();

        this.instance.visibleChange
            .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => {
                this.visible = value;
                this.visibleChange.emit(value);
                this.isOpen = value;
            });

        this.updatePosition();

        this.instance.show(delay);

        if (this.hideWithTimeout && this.trigger.includes(PopUpTriggers.Hover)) {
            this.ngZone.runOutsideAngular(() => {
                interval(this.leaveDelay, this.scheduler)
                    .pipe(
                        filter(() => this.trigger.includes(PopUpTriggers.Hover)),
                        filter(() => !this.hovered.getValue() && !this.instance?.hovered.getValue()),
                        takeUntilDestroyed(this.instance?.destroyRef)
                    )
                    .subscribe(() => this.hide());
            });
        }
    }

    /** Hides the pop-up after `delay` ms, honoring `preventClose` and the hover state on mouseleave.
     * @docs-private */
    hide(delay: number = this.leaveDelay) {
        if (this.preventClose) return;

        if (
            (this.instance && this.triggerName !== 'mouseleave') ||
            (this.triggerName === 'mouseleave' && !this.instance?.hovered.getValue())
        ) {
            this.ngZone.run(() => this.instance?.hide(delay));
        }
    }

    /** Detaches the overlay (if attached) and clears the current pop-up instance.
     * @docs-private */
    detach = (): void => {
        if (this.overlayRef?.hasAttached()) {
            this.overlayRef.detach();
        }

        this.instance = null;
    };

    /** Create the overlay config and position strategy
     * @docs-private */
    createOverlay(): OverlayRef {
        if (this.overlayRef) {
            return this.overlayRef;
        }

        // Create connected position strategy that listens for scroll events to reposition.
        this.strategy = this.overlay
            .position()
            .flexibleConnectedTo(this.getNativeElement())
            .withTransformOriginOn(this.originSelector)
            .withFlexibleDimensions(false)
            .withPositions([...EXTENDED_OVERLAY_POSITIONS])
            .withLockedPosition()
            .withScrollableContainers(this.scrollDispatcher.getAncestorScrollContainers(this.getNativeElement()));

        this.strategy.positionChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(this.onPositionChange);

        this.overlayRef = this.overlay.create({
            ...this.overlayConfig,
            direction: this.direction || undefined,
            positionStrategy: this.strategy,
            scrollStrategy: this.scrollStrategy()
        });

        this.subscribeOnClosingActions();

        this.overlayRef.detachments().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(this.detach);

        return this.overlayRef;
    }

    /** Resets the overlay position origin back to the host element.
     * @docs-private */
    resetOrigin() {
        this.strategy.setOrigin(this.getNativeElement());
    }

    /** Maps the CDK connection position back to a placement name, emits `placementChange`, and updates classes.
     * @docs-private */
    onPositionChange = ($event: ConnectedOverlayPositionChange): void => {
        if (!this.instance) return;

        let newPlacement = this.placement;

        const { originX, originY, overlayX, overlayY } = $event.connectionPair;

        Object.keys(this.availablePositions).some((key) => {
            if (
                originX === this.availablePositions[key].originX &&
                originY === this.availablePositions[key].originY &&
                overlayX === this.availablePositions[key].overlayX &&
                overlayY === this.availablePositions[key].overlayY
            ) {
                newPlacement = key as PopUpPlacements;

                return true;
            }

            return false;
        });

        this.placementChange.emit(newPlacement);

        this.updateClassMap(newPlacement);

        this.instance.detectChanges();
    };

    /** Rebinds the host DOM listeners (click/hover/focus/keydown) according to the configured triggers.
     * @docs-private */
    initListeners() {
        this.clearListeners();

        if (this.trigger.includes(PopUpTriggers.Click)) {
            this.listeners.set(...this.createListener('click', this.show));
        }

        if (this.trigger.includes(PopUpTriggers.Hover)) {
            this.listeners
                .set(...this.createListener('mouseenter', this.show))
                .set(...this.createListener('mouseleave', this.getMouseLeaveListener()));
        }

        if (this.trigger.includes(PopUpTriggers.Focus)) {
            this.listeners
                .set(...this.createListener('focus', this.show))
                .set(...this.createListener('blur', this.hide));
        }

        if (this.trigger.includes(PopUpTriggers.Keydown)) {
            this.listeners.set('keydown', (event) => {
                if (event instanceof KeyboardEvent && [ENTER, SPACE].includes(event.keyCode)) {
                    setTimeout(() => this.show());
                }
            });
        }

        this.listeners.forEach(this.addEventListener);
    }

    /** Returns the `mouseleave` handler — a delayed hide when `hideWithTimeout` is set, otherwise an immediate hide.
     * @docs-private */
    getMouseLeaveListener() {
        if (this.hideWithTimeout) {
            return () => setTimeout(() => this.hide(), this.leaveDelay);
        }

        return this.hide;
    }

    /** Updates the position of the current popover.
     * @docs-private */
    updatePosition(reapplyPosition: boolean = false) {
        this.overlayRef = this.createOverlay();

        this.subscribeOnClosingActions();

        const position = (this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy)
            .withPositions(this.getAdjustedPositions())
            .withPush(true);

        if (reapplyPosition) {
            setTimeout(() => position.reapplyLastPosition());
        }
    }

    /** Moves browser focus to the pop-up's native element.
     * @docs-private */
    focus() {
        this.getNativeElement().focus();
    }

    /** Returns the element the pop-up is bound to: the external element when set, otherwise the host element.
     * @docs-private */
    getNativeElement(): HTMLElement {
        return this.externalNativeElement || this.elementRef.nativeElement;
    }

    /** Sets an external element to anchor and measure the pop-up against instead of the host element.
     * @docs-private */
    setExternalNativeElement(value: HTMLElement) {
        this.externalNativeElement = value;
    }

    /**
     * Returns a list of positions that are aligned with the element's dimensions and offsets.
     * @docs-private */
    protected getAdjustedPositions(): ConnectionPositionPair[] {
        const res: ConnectionPositionPair[] = [];

        for (const pos of this.getPrioritizedPositions()) {
            const offset: KbqPopupTriggerOffset = this.arrow
                ? getOffset(pos, this.getNativeElement().getBoundingClientRect())
                : {};

            res.push({
                ...pos,
                ...offset
            });
        }

        return res;
    }

    /** Maps a priority placement value (or array of values) to the matching connected position pairs.
     * @docs-private */
    protected getPriorityPlacementStrategy(value: string | string[]): ConnectionPositionPair[] {
        const result: ConnectionPositionPair[] = [];
        const possiblePositions = Object.keys(this.availablePositions);

        if (Array.isArray(value)) {
            value.forEach((position: string) => {
                if (possiblePositions.includes(position)) {
                    result.push(this.availablePositions[position]);
                }
            });
        } else if (possiblePositions.includes(value)) {
            result.push(this.availablePositions[value]);
        }

        return result;
    }

    /** Returns the positions to try: the custom `placementPriority` when set, otherwise the default strategy.
     * @docs-private */
    protected getPrioritizedPositions() {
        if (this.placementPriority) {
            return this.getPriorityPlacementStrategy(this.placementPriority);
        }

        return POSITION_PRIORITY_STRATEGY[this.placement];
    }

    /** Removes all bound host event listeners and clears the listener map.
     * @docs-private */
    protected clearListeners() {
        this.listeners.forEach(this.removeEventListener);

        this.listeners.clear();
    }

    /** Wraps a trigger handler so it records the active trigger name and mouse event before running. */
    private createListener(name: string, listener: () => void): [string, (event: unknown) => void] {
        return [
            name,
            (event: unknown) => {
                this.triggerName = name;
                this.saveMouseEvent(event as MouseEvent);

                return listener.call(this);
            }
        ];
    }

    /** Remembers the last mouse event on `mouseenter`, used for cursor-relative positioning. */
    private saveMouseEvent(event: MouseEvent) {
        if (this.triggerName === 'mouseenter') {
            this.mouseEvent = event;
        }
    }

    /** Binds a single event listener to the pop-up's native element. */
    private addEventListener = (listener: EventListener, event: string) => {
        this.getNativeElement().addEventListener(event, listener);
    };

    /** Unbinds a single event listener from the pop-up's native element. */
    private removeEventListener = (listener: EventListener, event: string) => {
        this.getNativeElement().removeEventListener(event, listener);
    };

    /** (Re)subscribes to the closing-action streams and hides the pop-up, ignoring prevented click events. */
    private subscribeOnClosingActions() {
        this.closingActionsSubscription?.unsubscribe();

        this.closingActionsSubscription = this.closingActions()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .pipe(rxDelay(0))
            .subscribe((event) => {
                if (event?.type === 'click' && event.kbqPopoverPreventHide) {
                    return;
                }

                this.hide();
            });
    }
}

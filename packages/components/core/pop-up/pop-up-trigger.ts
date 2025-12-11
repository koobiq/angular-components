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
import { ENTER, ESCAPE, SPACE } from '@koobiq/cdk/keycodes';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { distinctUntilChanged, filter, delay as rxDelay } from 'rxjs/operators';
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

@Directive({
    host: {
        '(mouseenter)': 'hovered.next(true)',
        '(mouseleave)': 'hovered.next(false)'
    }
})
export abstract class KbqPopUpTrigger<T> implements OnInit, OnDestroy {
    /** Stream that emits when the popupTrigger is hovered. */
    readonly hovered = new BehaviorSubject<boolean>(false);

    protected readonly scheduler = inject(AsyncScheduler, { optional: true }) || undefined;

    protected readonly overlay: Overlay = inject(Overlay);
    protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    protected readonly ngZone: NgZone = inject(NgZone);
    protected readonly scrollDispatcher: ScrollDispatcher = inject(ScrollDispatcher);
    protected readonly hostView: ViewContainerRef = inject(ViewContainerRef);
    protected readonly direction = inject(Directionality, { optional: true });
    protected readonly destroyRef = inject(DestroyRef);
    protected readonly scrollable = inject(CdkScrollable, { optional: true });

    protected abstract scrollStrategy: () => ScrollStrategy;

    isOpen: boolean = false;

    enterDelay: number = 0;
    leaveDelay: number = 0;

    triggerName: string;

    overlayRef: OverlayRef | null;

    stickToWindow: KbqStickToWindowPlacementValues;

    container: HTMLElement;

    abstract disabled: boolean;
    abstract arrow: boolean;
    abstract trigger: string;
    abstract customClass: string;
    abstract content: string | TemplateRef<any>;

    abstract placementChange: EventEmitter<string>;
    abstract visibleChange: EventEmitter<boolean>;

    protected abstract originSelector: string;
    protected abstract overlayConfig: OverlayConfig;

    protected placement: KbqPopUpPlacementValues = PopUpPlacements.Top;
    protected placementPriority: string | string[] | null = null;

    protected visible = false;

    protected _content: string | TemplateRef<any>;
    protected _disabled: boolean;
    protected _customClass: string;

    protected portal: ComponentPortal<T>;
    protected instance: any | null;

    protected listeners = new Map<string, EventListener>();
    protected closingActionsSubscription: Subscription;

    protected readonly availablePositions: { [key: string]: ConnectionPositionPair } = POSITION_MAP;

    protected mouseEvent?: MouseEvent;
    protected strategy: FlexibleConnectedPositionStrategy;

    /** Hide pop-up with timeout. Need if you want to show pop-up after leaving trigger */
    protected hideWithTimeout: boolean = false;

    /** prevents closure by any event */
    protected preventClose: boolean = false;

    abstract updateClassMap(newPlacement?: string): void;

    abstract updateData(): void;

    abstract closingActions(): Observable<any>;

    abstract getOverlayHandleComponentType(): Type<T>;

    ngOnInit(): void {
        this.initListeners();
    }

    ngOnDestroy(): void {
        this.overlayRef?.dispose();

        this.listeners.forEach(this.removeEventListener);

        this.listeners.clear();
    }

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

    updatePlacementPriority(value) {
        if (value && value.length > 0) {
            this.placementPriority = value;
        } else {
            this.placementPriority = null;
        }
    }

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

    keydownHandler(event: KeyboardEvent) {
        if (this.isOpen && event.keyCode === ESCAPE) {
            this.hide();
        }
    }

    touchendHandler() {
        this.hide();
    }

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
                    .subscribe(this.hide);
            });
        }
    }

    hide = (delay: number = this.leaveDelay) => {
        if (this.preventClose) return;

        if (
            (this.instance && this.triggerName !== 'mouseleave') ||
            (this.triggerName === 'mouseleave' && !this.instance?.hovered.getValue())
        ) {
            this.ngZone.run(() => this.instance?.hide(delay));
        }
    };

    detach = (): void => {
        if (this.overlayRef?.hasAttached()) {
            this.overlayRef.detach();
        }

        this.instance = null;
    };

    /** Create the overlay config and position strategy */
    createOverlay(): OverlayRef {
        if (this.overlayRef) {
            return this.overlayRef;
        }

        // Create connected position strategy that listens for scroll events to reposition.
        this.strategy = this.overlay
            .position()
            .flexibleConnectedTo(this.elementRef)
            .withTransformOriginOn(this.originSelector)
            .withFlexibleDimensions(false)
            .withPositions([...EXTENDED_OVERLAY_POSITIONS])
            .withLockedPosition()
            .withScrollableContainers(this.scrollDispatcher.getAncestorScrollContainers(this.elementRef));

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

    resetOrigin() {
        this.strategy.setOrigin(this.elementRef);
    }

    onPositionChange = ($event: ConnectedOverlayPositionChange): void => {
        if (!this.instance) {
            return;
        }

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

    getMouseLeaveListener() {
        if (this.hideWithTimeout) {
            return () => setTimeout(this.hide, this.leaveDelay);
        }

        return this.hide;
    }

    /** Updates the position of the current popover. */
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

    focus() {
        this.elementRef.nativeElement.focus();
    }

    /**
     * Returns a list of positions that are aligned with the element's dimensions and offsets.
     * @protected
     */
    protected getAdjustedPositions(): ConnectionPositionPair[] {
        const res: ConnectionPositionPair[] = [];

        for (const pos of this.getPrioritizedPositions()) {
            const offset: KbqPopupTriggerOffset = this.arrow
                ? getOffset(pos, this.elementRef.nativeElement.getBoundingClientRect())
                : {};

            res.push({
                ...pos,
                ...offset
            });
        }

        return res;
    }

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

    protected getPrioritizedPositions() {
        if (this.placementPriority) {
            return this.getPriorityPlacementStrategy(this.placementPriority);
        }

        return POSITION_PRIORITY_STRATEGY[this.placement];
    }

    protected clearListeners() {
        this.listeners.forEach(this.removeEventListener);

        this.listeners.clear();
    }

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

    private saveMouseEvent(event: MouseEvent) {
        if (this.triggerName === 'mouseenter') {
            this.mouseEvent = event;
        }
    }

    private addEventListener = (listener: EventListener, event: string) => {
        this.elementRef.nativeElement.addEventListener(event, listener);
    };

    private removeEventListener = (listener: EventListener, event: string) => {
        this.elementRef.nativeElement.removeEventListener(event, listener);
    };

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

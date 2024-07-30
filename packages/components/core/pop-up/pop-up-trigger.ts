import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ConnectedOverlayPositionChange,
    ConnectionPositionPair,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    OverlayRef,
    ScrollDispatcher
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
    Directive,
    ElementRef,
    EventEmitter,
    NgZone,
    OnDestroy,
    OnInit,
    TemplateRef,
    Type,
    ViewContainerRef
} from '@angular/core';
import { ENTER, ESCAPE, SPACE } from '@koobiq/cdk/keycodes';
import { Observable, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, delay as rxDelay, takeUntil } from 'rxjs/operators';
import {
    EXTENDED_OVERLAY_POSITIONS,
    POSITION_MAP,
    POSITION_PRIORITY_STRATEGY,
    POSITION_TO_CSS_MAP
} from '../overlay/overlay-position-map';
import { PopUpPlacements, PopUpTriggers } from './constants';

@Directive()
export abstract class KbqPopUpTrigger<T> implements OnInit, OnDestroy {
    isOpen: boolean = false;

    enterDelay: number = 0;
    leaveDelay: number = 0;

    abstract disabled: boolean;
    abstract trigger: string;
    abstract customClass: string;
    abstract content: string | TemplateRef<any>;

    abstract placementChange: EventEmitter<string>;
    abstract visibleChange: EventEmitter<boolean>;

    protected abstract originSelector: string;
    protected abstract overlayConfig: OverlayConfig;

    protected placement = PopUpPlacements.Top;
    protected placementPriority: string | string[] | null = null;

    protected visible = false;

    protected _content: string | TemplateRef<any>;
    protected _disabled: boolean;
    protected _customClass: string;

    protected overlayRef: OverlayRef | null;
    protected portal: ComponentPortal<T>;
    protected instance: any | null;

    protected listeners = new Map<string, EventListener>();
    protected closingActionsSubscription: Subscription;

    protected readonly availablePositions: { [key: string]: ConnectionPositionPair };
    protected readonly destroyed = new Subject<void>();
    protected triggerName: string;

    protected constructor(
        protected overlay: Overlay,
        protected elementRef: ElementRef,
        protected ngZone: NgZone,
        protected scrollDispatcher: ScrollDispatcher,
        protected hostView: ViewContainerRef,
        protected scrollStrategy,
        protected direction?: Directionality
    ) {
        this.availablePositions = POSITION_MAP;
    }

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

        this.destroyed.next();
        this.destroyed.complete();
    }

    updatePlacement(value: PopUpPlacements) {
        if (POSITION_TO_CSS_MAP[value]) {
            this.placement = value;

            this.updateClassMap();
        } else {
            this.placement = PopUpPlacements.Top;

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

    handleKeydown(event: KeyboardEvent) {
        if (this.isOpen && event.keyCode === ESCAPE) {
            this.hide();
        }
    }

    handleTouchend() {
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

        this.instance = this.overlayRef.attach(this.portal).instance;

        this.instance.afterHidden().pipe(takeUntil(this.destroyed)).subscribe(this.detach);

        this.updateClassMap();

        this.updateData();

        this.instance.visibleChange.pipe(takeUntil(this.destroyed), distinctUntilChanged()).subscribe((value) => {
            this.visible = value;
            this.visibleChange.emit(value);
            this.isOpen = value;
        });

        this.updatePosition();

        this.instance.show(delay);
    }

    hide(delay: number = this.leaveDelay): void {
        if (this.instance) {
            this.ngZone.run(() => this.instance.hide(delay));
        }
    }

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
        const strategy = this.overlay
            .position()
            .flexibleConnectedTo(this.elementRef)
            .withTransformOriginOn(this.originSelector)
            .withFlexibleDimensions(false)
            .withPositions([...EXTENDED_OVERLAY_POSITIONS])
            .withLockedPosition()
            .withScrollableContainers(this.scrollDispatcher.getAncestorScrollContainers(this.elementRef));

        strategy.positionChanges.pipe(takeUntil(this.destroyed)).subscribe(this.onPositionChange);

        this.overlayRef = this.overlay.create({
            ...this.overlayConfig,
            direction: this.direction,
            positionStrategy: strategy,
            scrollStrategy: this.scrollStrategy()
        });

        this.subscribeOnClosingActions();

        this.overlayRef.detachments().pipe(takeUntil(this.destroyed)).subscribe(this.detach);

        return this.overlayRef;
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
                .set(...this.createListener('mouseleave', this.hide));
        }

        if (this.trigger.includes(PopUpTriggers.Focus)) {
            this.listeners
                .set(...this.createListener('focus', this.show))
                .set(...this.createListener('blur', this.hide));
        }

        if (this.trigger.includes(PopUpTriggers.Keydown)) {
            this.listeners.set('keydown', (event) => {
                if (event instanceof KeyboardEvent && [ENTER, SPACE].includes(event.keyCode)) {
                    this.show();
                }
            });
        }

        this.listeners.forEach(this.addEventListener);
    }

    /** Updates the position of the current popover. */
    updatePosition(reapplyPosition: boolean = false) {
        this.overlayRef = this.createOverlay();

        this.subscribeOnClosingActions();

        const position = (this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy)
            .withPositions(this.getPrioritizedPositions())
            .withPush(true);

        if (reapplyPosition) {
            setTimeout(() => position.reapplyLastPosition());
        }
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

    private createListener(name: string, listener: () => void): [string, () => void] {
        return [
            name,
            () => {
                this.triggerName = name;

                return listener.call(this);
            }

        ];
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
            .pipe(takeUntil(this.destroyed))
            .pipe(rxDelay(0))
            .subscribe((event) => {
                if (event?.type === 'click' && event.kbqPopoverPreventHide) {
                    return;
                }

                this.hide();
            });
    }
}

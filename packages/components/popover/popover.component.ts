import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    CdkScrollable,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    ScrollDispatcher,
    ScrollStrategy
} from '@angular/cdk/overlay';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    NgZone,
    Optional,
    Output,
    TemplateRef,
    Type,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {
    KbqPopUp,
    KbqPopUpTrigger,
    POSITION_TO_CSS_MAP,
    PopUpPlacements,
    PopUpSizes,
    PopUpTriggers
} from '@koobiq/components/core';
import { NEVER, merge } from 'rxjs';
import { kbqPopoverAnimations } from './popover-animations';

@Component({
    selector: 'kbq-popover-component',
    templateUrl: './popover.component.html',
    preserveWhitespaces: false,
    styleUrls: ['./popover.scss'],
    host: {
        '(keydown.esc)': 'hide(0)'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [kbqPopoverAnimations.popoverState]
})
export class KbqPopoverComponent extends KbqPopUp {
    prefix = 'kbq-popover';

    header: string | TemplateRef<any>;
    footer: string | TemplateRef<any>;

    isTrapFocus: boolean = false;

    @ViewChild('popoverContent') popoverContent: ElementRef<HTMLDivElement>;
    contentScrollTop: number = 0;

    constructor(changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    updateClassMap(placement: string, customClass: string, size: PopUpSizes) {
        super.updateClassMap(placement, customClass, { [`${this.prefix}_${size}`]: !!size });
    }

    updateTrapFocus(isTrapFocus: boolean): void {
        this.isTrapFocus = isTrapFocus;
    }
}

export const KBQ_POPOVER_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>('kbq-popover-scroll-strategy');

/** @docs-private */
export function kbqPopoverScrollStrategyFactory(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition({ scrollThrottle: 20 });
}

/** @docs-private */
export const KBQ_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: KBQ_POPOVER_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: kbqPopoverScrollStrategyFactory
};

/** Creates an error to be thrown if the user supplied an invalid popover position. */
export function getKbqPopoverInvalidPositionError(position: string) {
    return Error(`KbqPopover position "${position}" is invalid.`);
}

@Directive({
    selector: '[kbqPopover]',
    exportAs: 'kbqPopover',
    host: {
        '[class.kbq-popover_open]': 'isOpen',
        '[class.kbq-active]': 'hasClickTrigger && isOpen',
        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()'
    }
})
export class KbqPopoverTrigger extends KbqPopUpTrigger<KbqPopoverComponent> implements AfterContentInit {
    @Input('kbqPopoverVisible')
    get popoverVisible(): boolean {
        return this.visible;
    }

    set popoverVisible(value: boolean) {
        super.updateVisible(value);
    }

    @Input('kbqPopoverPlacement')
    get popoverPlacement(): PopUpPlacements {
        return this.placement;
    }

    set popoverPlacement(value: PopUpPlacements) {
        super.updatePlacement(value);
    }

    @Input('kbqPopoverPlacementPriority')
    get popoverPlacementPriority() {
        return this.placementPriority;
    }

    set popoverPlacementPriority(value) {
        super.updatePlacementPriority(value);
    }

    @Input()
    get hasBackdrop(): boolean {
        return this._hasBackdrop;
    }

    set hasBackdrop(value: boolean) {
        this._hasBackdrop = coerceBooleanProperty(value);
    }

    private _hasBackdrop: boolean = false;

    @Input('kbqPopoverHeader')
    get header(): string | TemplateRef<any> {
        return this._header;
    }

    set header(value: string | TemplateRef<any>) {
        this._header = value;

        this.updateData();
    }

    private _header: string | TemplateRef<any>;

    @Input('kbqPopoverContent')
    get content(): string | TemplateRef<any> {
        return this._content;
    }

    set content(value: string | TemplateRef<any>) {
        this._content = value;

        this.updateData();
    }

    @Input('kbqPopoverFooter')
    get footer(): string | TemplateRef<any> {
        return this._footer;
    }

    set footer(value: string | TemplateRef<any>) {
        this._footer = value;

        this.updateData();
    }

    private _footer: string | TemplateRef<any>;

    @Input('kbqPopoverDisabled')
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);

        if (this._disabled) {
            this.hide();
        }
    }

    @Input('kbqTrigger')
    get trigger(): string {
        return this._trigger;
    }

    set trigger(value: string) {
        if (value) {
            this._trigger = value;
        } else {
            this._trigger = `${PopUpTriggers.Click}, ${PopUpTriggers.Keydown}`;
        }

        this.initListeners();
    }

    private _trigger: string = `${PopUpTriggers.Click}, ${PopUpTriggers.Keydown}`;

    @Input('kbqPopoverSize')
    get size(): PopUpSizes {
        return this._size;
    }

    set size(value: PopUpSizes) {
        if ([PopUpSizes.Small, PopUpSizes.Medium, PopUpSizes.Large].includes(value)) {
            this._size = value;

            this.updateClassMap();
        } else {
            this._size = PopUpSizes.Medium;
        }
    }

    private _size: PopUpSizes = PopUpSizes.Medium;

    @Input('kbqPopoverClass')
    get customClass() {
        return this._customClass;
    }

    set customClass(value: string) {
        this._customClass = value;

        this.updateClassMap();
    }

    /**
     * Controls the behavior of closing the component on scroll.
     * The default value is `false`.
     * Use CloseScrollStrategy as alternative
     */
    @Input()
    get closeOnScroll(): boolean | null {
        return this._closeOnScroll;
    }

    set closeOnScroll(value: boolean) {
        this._closeOnScroll = coerceBooleanProperty(value);
    }

    private _closeOnScroll: boolean | null = null;

    get hasClickTrigger(): boolean {
        return this.trigger.includes(PopUpTriggers.Click);
    }

    @Input() backdropClass: string = 'cdk-overlay-transparent-backdrop';

    @Output('kbqPopoverPlacementChange') placementChange = new EventEmitter();

    @Output('kbqPopoverVisibleChange') visibleChange = new EventEmitter<boolean>();

    protected originSelector = '.kbq-popover';

    protected get overlayConfig(): OverlayConfig {
        return {
            panelClass: 'kbq-popover__panel',
            hasBackdrop: this.hasBackdrop,
            backdropClass: this.backdropClass
        };
    }

    constructor(
        overlay: Overlay,
        elementRef: ElementRef,
        ngZone: NgZone,
        scrollDispatcher: ScrollDispatcher,
        hostView: ViewContainerRef,
        @Inject(KBQ_POPOVER_SCROLL_STRATEGY) scrollStrategy,
        @Optional() direction: Directionality
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction);
    }

    ngAfterContentInit(): void {
        if (this.closeOnScroll === null) {
            this.scrollDispatcher.scrolled().subscribe((scrollable: CdkScrollable | void) => {
                if (!scrollable?.getElementRef().nativeElement.classList.contains('kbq-hide-nested-popup')) return;

                const parentRects = scrollable.getElementRef().nativeElement.getBoundingClientRect();
                const childRects = this.elementRef.nativeElement.getBoundingClientRect();

                if (childRects.bottom < parentRects.top || childRects.top > parentRects.bottom) {
                    this.hide();
                }
            });
        }
    }

    updateData() {
        if (!this.instance) {
            return;
        }

        this.instance.header = this.header;
        this.instance.content = this.content;
        this.instance.footer = this.footer;

        this.instance.updateTrapFocus(this.trigger !== PopUpTriggers.Focus);

        if (this.isOpen) {
            this.updatePosition(true);
        }
    }

    /** Updates the position of the current popover. */
    updatePosition(reapplyPosition: boolean = false) {
        this.overlayRef = this.createOverlay();

        const position = (this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy)
            .withPositions(this.getPrioritizedPositions())
            .withPush(true);

        if (reapplyPosition) {
            setTimeout(() => position.reapplyLastPosition());
        }
    }

    getOverlayHandleComponentType(): Type<KbqPopoverComponent> {
        return KbqPopoverComponent;
    }

    updateClassMap(newPlacement: string = this.placement) {
        if (!this.instance) {
            return;
        }

        this.instance.updateClassMap(POSITION_TO_CSS_MAP[newPlacement], this.customClass, this.size);
        this.instance.markForCheck();
    }

    closingActionsForClick() {
        if (this.hasClickTrigger) {
            return [
                this.overlayRef!.backdropClick(),
                this.hasBackdrop ? NEVER : this.overlayRef!.outsidePointerEvents()
            ];
        }

        return [];
    }

    closingActions() {
        return merge(...this.closingActionsForClick(), this.closeOnScroll ? this.scrollDispatcher.scrolled() : NEVER);
    }
}

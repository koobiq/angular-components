import { CdkTrapFocus } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    CdkScrollable,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    ScrollStrategy
} from '@angular/cdk/overlay';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    Directive,
    ElementRef,
    EventEmitter,
    InjectionToken,
    Input,
    Output,
    TemplateRef,
    Type,
    ViewChild,
    ViewEncapsulation,
    inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    KbqComponentColors,
    KbqPopUp,
    KbqPopUpTrigger,
    POSITION_TO_CSS_MAP,
    PopUpPlacements,
    PopUpSizes,
    PopUpTriggers
} from '@koobiq/components/core';
import { NEVER, fromEvent, merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { kbqPopoverAnimations } from './popover-animations';

@Component({
    selector: 'kbq-popover-component',
    templateUrl: './popover.component.html',
    preserveWhitespaces: false,
    styleUrls: ['./popover.scss', './popover-tokens.scss'],
    host: {
        '(keydown.esc)': 'onEscape()'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [kbqPopoverAnimations.popoverState]
})
export class KbqPopoverComponent extends KbqPopUp implements AfterViewInit {
    prefix = 'kbq-popover';

    header: string | TemplateRef<any>;
    footer: string | TemplateRef<any>;

    trigger: KbqPopoverTrigger;

    isTrapFocus: boolean = false;
    hasCloseButton: boolean = false;

    @ViewChild('popoverContent') popoverContent: ElementRef<HTMLDivElement>;
    @ViewChild(CdkTrapFocus) cdkTrapFocus: CdkTrapFocus;

    private debounceTime = 15;
    private readonly destroyRef = inject(DestroyRef);
    isContentTopOverflow: boolean = false;
    isContentBottomOverflow: boolean = false;

    ngAfterViewInit() {
        if (!this.popoverContent) return;

        this.checkContentOverflow(this.popoverContent.nativeElement);

        fromEvent(this.popoverContent.nativeElement, 'scroll')
            .pipe(debounceTime(this.debounceTime), takeUntilDestroyed(this.destroyRef))
            .subscribe((event) => {
                this.checkContentOverflow(event.target as HTMLElement);
            });

        this.cdkTrapFocus.focusTrap.focusFirstTabbableElement();
    }

    onContentChange() {
        this.checkContentOverflow(this.popoverContent.nativeElement);
    }

    checkContentOverflow(contentElement: HTMLElement) {
        const { scrollTop, offsetHeight, scrollHeight } = contentElement;

        this.isContentTopOverflow = scrollTop > 0;

        this.isContentBottomOverflow = scrollTop + offsetHeight < scrollHeight;

        super.detectChanges();
    }

    updateClassMap(placement: string, customClass: string, size: PopUpSizes) {
        super.updateClassMap(placement, customClass, { [`${this.prefix}_${size}`]: !!size });
    }

    updateTrapFocus(isTrapFocus: boolean): void {
        this.isTrapFocus = isTrapFocus;
    }

    onEscape() {
        this.hide(0);

        this.trigger.focus();
    }

    protected readonly componentColors = KbqComponentColors;
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
    protected scrollStrategy: () => ScrollStrategy = inject(KBQ_POPOVER_SCROLL_STRATEGY);

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

    @Input()
    get hasCloseButton() {
        return this._hasCloseButton;
    }
    set hasCloseButton(value) {
        this._hasCloseButton = value;
        this.updateData();
    }
    private _hasCloseButton = false;

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

    // @TODO add realization for arrow (#DS-2514)
    arrow: boolean = true;

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
        this.instance.hasCloseButton = this.hasCloseButton;

        this.instance.updateTrapFocus(this.trigger !== PopUpTriggers.Focus);

        if (this.isOpen) {
            this.updatePosition(true);
        }
    }

    /** Updates the position of the current popover. */
    updatePosition(reapplyPosition: boolean = false) {
        this.overlayRef = this.createOverlay();

        const position = (this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy)
            .withPositions(this.getAdjustedPositions())
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

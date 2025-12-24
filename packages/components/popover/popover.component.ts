import { CdkTrapFocus } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { CdkObserveContent } from '@angular/cdk/observers';
import {
    CdkScrollable,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    ScrollStrategy
} from '@angular/cdk/overlay';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    InjectionToken,
    Input,
    OnInit,
    Output,
    TemplateRef,
    Type,
    ViewChild,
    ViewEncapsulation,
    booleanAttribute,
    inject,
    numberAttribute
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KbqComponentColors,
    KbqPopUp,
    KbqPopUpPlacementValues,
    KbqPopUpSizeValues,
    KbqPopUpTrigger,
    KbqStickToWindowPlacementValues,
    POSITION_TO_CSS_MAP,
    PopUpSizes,
    PopUpTriggers,
    applyPopupMargins
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { NEVER, fromEvent, merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { kbqPopoverAnimations } from './popover-animations';

export const defaultOffsetYWithArrow = 8;

@Component({
    selector: 'kbq-popover-component',
    imports: [
        NgTemplateOutlet,
        CdkObserveContent,
        KbqButtonModule,
        KbqIconModule,
        CdkTrapFocus,
        NgClass
    ],
    templateUrl: './popover.component.html',
    styleUrls: ['./popover.scss', './popover-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    host: {
        '(keydown.esc)': 'onEscape()'
    },
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
    @ViewChild('popover') elementRef: ElementRef;
    @ViewChild(CdkTrapFocus) cdkTrapFocus: CdkTrapFocus;

    private debounceTime = 15;
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
        this.visibleChange.subscribe((state) => {
            if (this.offset !== null && state) {
                applyPopupMargins(
                    this.renderer,
                    this.elementRef.nativeElement,
                    this.prefix,
                    `${this.offset!.toString()}px`
                );

                this.setStickPosition();
            }
        });
    }

    onContentChange() {
        this.checkContentOverflow(this.popoverContent.nativeElement);
    }

    checkContentOverflow(contentElement: HTMLElement) {
        const { scrollTop, offsetHeight, scrollHeight } = contentElement;

        this.isContentTopOverflow = scrollTop > 0;

        this.isContentBottomOverflow = Math.round(scrollTop + offsetHeight) < scrollHeight;

        super.detectChanges();
    }

    updateClassMap(placement: string, customClass: string, size: KbqPopUpSizeValues) {
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
        '(keydown)': 'keydownHandler($event)',
        '(touchend)': 'touchendHandler()'
    }
})
export class KbqPopoverTrigger extends KbqPopUpTrigger<KbqPopoverComponent> implements AfterContentInit, OnInit {
    protected scrollStrategy: () => ScrollStrategy = inject(KBQ_POPOVER_SCROLL_STRATEGY);

    /** prevents closure by any event */
    @Input({ alias: 'kbqPopoverPreventClose', transform: booleanAttribute }) override preventClose: boolean = false;

    /** disables default padding for all popover elements (header, content and footer) */
    @Input({ transform: booleanAttribute }) defaultPaddings = true;

    @Input('kbqPopoverVisible')
    get popoverVisible(): boolean {
        return this.visible;
    }

    set popoverVisible(value: boolean) {
        super.updateVisible(value);
    }

    @Input('kbqPopoverPlacement')
    get popoverPlacement(): KbqPopUpPlacementValues {
        return this.placement;
    }

    set popoverPlacement(value: KbqPopUpPlacementValues) {
        super.updatePlacement(value);
    }

    @Input('kbqPopoverPlacementPriority')
    get popoverPlacementPriority() {
        return this.placementPriority;
    }

    set popoverPlacementPriority(value) {
        super.updatePlacementPriority(value);
    }

    /**
     * Additionally positions the element relative to the window side (Top, Right, Bottom and Left).
     * If container is specified, the positioning will be relative to it.
     * */
    @Input('kbqPopoverStickToWindow') stickToWindow: KbqStickToWindowPlacementValues;

    /** Container for additional positioning, used with kbqPopoverStickToWindow */
    @Input() container: HTMLElement;

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

            if (this.trigger.includes(PopUpTriggers.Hover)) {
                this.hideWithTimeout = true;
                this.leaveDelay = this.leaveDelay ?? 500;
            }
        } else {
            this._trigger = `${PopUpTriggers.Click}, ${PopUpTriggers.Keydown}`;
        }

        this.initListeners();
    }

    private _trigger: string = `${PopUpTriggers.Click}, ${PopUpTriggers.Keydown}`;

    @Input('kbqPopoverSize')
    get size(): KbqPopUpSizeValues {
        return this._size;
    }

    set size(value: KbqPopUpSizeValues) {
        if ([PopUpSizes.Small, PopUpSizes.Medium, PopUpSizes.Large].includes(value as PopUpSizes)) {
            this._size = value;

            this.updateClassMap();
        } else {
            this._size = PopUpSizes.Medium;
        }
    }

    private _size: KbqPopUpSizeValues = PopUpSizes.Medium;

    @Input('kbqPopoverClass')
    get customClass() {
        return this._customClass;
    }

    set customClass(value: string) {
        this._customClass = value;

        this.updateClassMap();
    }

    /** Context for popover templates (kbqPopoverHeader, kbqPopoverContent and kbqPopoverFooter). */
    @Input('kbqPopoverContext')
    get context() {
        return this._context;
    }

    set context(ctx) {
        this._context = ctx;
        this.updateData();
    }

    private _context: unknown = null;

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
    @Input({ alias: 'kbqPopoverArrow', transform: booleanAttribute }) arrow: boolean = true;

    @Input({ alias: 'kbqPopoverOffset', transform: numberAttribute }) offset: number | null = defaultOffsetYWithArrow;

    /** Delay before closing in milliseconds. The default value for kbqTrigger=PopUpTriggers.Hover is 500 ms. */
    @Input({ alias: 'kbqLeaveDelay', transform: numberAttribute }) leaveDelay: number;

    @Output('kbqPopoverPlacementChange') readonly placementChange = new EventEmitter();

    @Output('kbqPopoverVisibleChange') readonly visibleChange = new EventEmitter<boolean>();

    protected originSelector = '.kbq-popover';

    protected get overlayConfig(): OverlayConfig {
        return {
            panelClass: 'kbq-popover__panel',
            hasBackdrop: this.hasBackdrop,
            backdropClass: this.backdropClass
        };
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.scrollable
            ?.elementScrolled()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(this.hideIfNotInViewPort);
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
        if (!this.instance) return;

        this.instance.header = this.header;
        this.instance.content = this.content;
        this.instance.context = this.context && { $implicit: this.context };
        this.instance.arrow = this.arrow;
        this.instance.offset = this.offset;
        this.instance.footer = this.footer;
        this.instance.hasCloseButton = this.hasCloseButton;
        this.instance.defaultPaddings = this.defaultPaddings;

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
            return this.defaultClosingActions();
        }

        return [];
    }

    defaultClosingActions() {
        return [
            this.overlayRef!.backdropClick(),
            this.hasBackdrop ? NEVER : this.overlayRef!.outsidePointerEvents()
        ];
    }

    closingActions() {
        return merge(...this.closingActionsForClick(), this.closeOnScroll ? this.scrollDispatcher.scrolled() : NEVER);
    }

    private hideIfNotInViewPort = () => {
        if (!this.scrollable) return;

        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        const containerRect = this.scrollable.getElementRef().nativeElement.getBoundingClientRect();

        if (
            !(
                rect.bottom >= containerRect.top &&
                rect.right >= containerRect.left &&
                rect.top <= containerRect.bottom &&
                rect.left <= containerRect.right
            )
        ) {
            this.hide();
        }
    };
}

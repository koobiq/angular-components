import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Point } from '@angular/cdk/drag-drop';
import { Overlay, OverlayConfig, ScrollStrategy } from '@angular/cdk/overlay';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    OnDestroy,
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
import {
    KBQ_PARENT_POPUP,
    KbqComponentColors,
    KbqParentPopup,
    KbqPopUp,
    KbqPopUpPlacementValues,
    KbqPopUpTrigger,
    POSITION_TO_CSS_MAP,
    PopUpPlacements,
    PopUpTriggers,
    applyPopupMargins
} from '@koobiq/components/core';
import { EMPTY, merge } from 'rxjs';
import { kbqTooltipAnimations } from './tooltip.animations';

export enum TooltipModifier {
    Default = 'default',
    Warning = 'warning',
    Extended = 'extended'
}

export const KBQ_TOOLTIP_OPEN_TIME = new InjectionToken<() => ScrollStrategy>('kbq-tooltip-open-time');

/** @docs-private */
export const KBQ_TOOLTIP_OPEN_TIME_PROVIDER = {
    provide: KBQ_TOOLTIP_OPEN_TIME,
    useValue: { value: 0 }
};

export const MIN_TIME_FOR_DELAY = 2000;

@Component({
    selector: 'kbq-tooltip-component',
    imports: [
        NgClass,
        NgTemplateOutlet
    ],
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.scss', './tooltip-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [kbqTooltipAnimations.tooltipState],
    providers: [KBQ_TOOLTIP_OPEN_TIME_PROVIDER]
})
export class KbqTooltipComponent extends KbqPopUp {
    prefix = 'kbq-tooltip';

    @ViewChild('tooltip') elementRef: ElementRef;

    constructor(@Inject(KBQ_TOOLTIP_OPEN_TIME) private openTime) {
        super();
    }

    show(delay: number) {
        if (!this.content) {
            return;
        }

        super.show(Date.now() - this.openTime.value < MIN_TIME_FOR_DELAY ? 0 : delay);

        if (this.offset !== null) {
            applyPopupMargins(
                this.renderer,
                this.elementRef.nativeElement,
                this.prefix,
                `${this.offset!.toString()}px`
            );
        }

        this.openTime.value = Date.now();
    }

    updateClassMap(placement: string, customClass: string, { modifier }) {
        const classMap = {
            [`${this.prefix}_${modifier}`]: true
        };

        super.updateClassMap(placement, customClass, classMap);
    }
}

export const KBQ_TOOLTIP_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>('kbq-tooltip-scroll-strategy');

/** @docs-private */
export function kbqTooltipScrollStrategyFactory(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.close();
}

/** @docs-private */
export const KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: KBQ_TOOLTIP_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: kbqTooltipScrollStrategyFactory
};

@Directive({
    selector: '[kbqTooltip]',
    exportAs: 'kbqTooltip',
    host: {
        '[class.kbq-tooltip_open]': 'isOpen',

        '(keydown)': 'keydownHandler($event)',
        '(touchend)': 'touchendHandler()'
    }
})
export class KbqTooltipTrigger extends KbqPopUpTrigger<KbqTooltipComponent> implements AfterViewInit, OnDestroy {
    protected scrollStrategy: () => ScrollStrategy = inject(KBQ_TOOLTIP_SCROLL_STRATEGY);
    protected parentPopup = inject<KbqParentPopup>(KBQ_PARENT_POPUP, { optional: true });
    protected focusMonitor: FocusMonitor = inject(FocusMonitor);

    /**
     * Changes hiding behavior. By default, tooltip is hidden on mouseleave from trigger.
     * Setting hideWithTimeout to true will delay tooltip hiding and will not hide when the mouse moves from trigger
     * to tooltip.
     */
    @Input({ transform: booleanAttribute }) hideWithTimeout: boolean = false;

    @Input('kbqVisible')
    get tooltipVisible(): boolean {
        return this.visible;
    }

    set tooltipVisible(value: boolean) {
        super.updateVisible(value);
    }

    @Input('kbqPlacement')
    get tooltipPlacement(): KbqPopUpPlacementValues {
        return this.placement;
    }

    /**
     * Positions the tooltip relative to the mouse cursor. Only available for top and bottom kbqPlacement.
     * Does not work with kbqPlacementPriority.
     */
    @Input({ alias: 'kbqRelativeToPointer', transform: booleanAttribute }) relativeToPointer: boolean = false;

    set tooltipPlacement(value: KbqPopUpPlacementValues) {
        super.updatePlacement(value);
    }

    @Input('kbqPlacementPriority')
    get tooltipPlacementPriority() {
        return this.placementPriority;
    }

    set tooltipPlacementPriority(value) {
        super.updatePlacementPriority(value);
    }

    @Input('kbqTooltip')
    get content(): string | TemplateRef<any> {
        return this._content;
    }

    set content(content: string | TemplateRef<any>) {
        this._content = content;

        this.updateData();
    }

    @Input('kbqTooltipDisabled')
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);

        if (this._disabled) {
            this.hide();
        }
    }

    @Input('kbqEnterDelay') enterDelay = 400;
    @Input('kbqLeaveDelay') leaveDelay = 0;

    @Input('kbqTrigger')
    get trigger(): string {
        return this._trigger;
    }

    set trigger(value: string) {
        if (value) {
            this._trigger = value;
        } else {
            this._trigger = `${PopUpTriggers.Hover}, ${PopUpTriggers.Focus}`;
        }

        this.initListeners();
    }

    protected _trigger = `${PopUpTriggers.Hover}, ${PopUpTriggers.Focus}`;

    @Input('kbqTooltipClass')
    get customClass(): string {
        return this._customClass || '';
    }

    set customClass(value: string) {
        if (value) {
            this._customClass = value;

            this.updateClassMap();
        } else {
            this._customClass = '';
        }
    }

    @Input('kbqTooltipContext')
    get context() {
        return this._context;
    }

    set context(ctx) {
        this._context = ctx;
        this.updateData();
    }

    private _context: any = null;

    @Input('kbqTooltipColor')
    get color(): string {
        return `kbq-${this._color}`;
    }

    set color(value: KbqComponentColors | string) {
        this._color = value || KbqComponentColors.Contrast;
    }

    /** @docs-private */
    protected _color: KbqComponentColors | string = KbqComponentColors.Contrast;

    @Input({ alias: 'kbqTooltipArrow', transform: booleanAttribute }) arrow: boolean = true;
    @Input({ alias: 'kbqTooltipOffset', transform: numberAttribute }) offset: number | null = null;

    @Output('kbqPlacementChange') readonly placementChange = new EventEmitter();

    @Output('kbqVisibleChange') readonly visibleChange = new EventEmitter<boolean>();

    private get hasClickInTrigger(): boolean {
        return this.trigger.includes(PopUpTriggers.Click);
    }

    protected originSelector = '.kbq-tooltip';

    protected overlayConfig: OverlayConfig = {
        panelClass: 'kbq-tooltip-panel'
    };

    protected modifier: TooltipModifier = TooltipModifier.Default;

    ngAfterViewInit(): void {
        this.parentPopup?.closedStream.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.hide());

        this.focusMonitor.monitor(this.elementRef.nativeElement);
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);

        super.ngOnDestroy();
    }

    show(delay: number = this.enterDelay) {
        if (this.triggerName === 'focus' && this.focusMonitor['_lastFocusOrigin'] !== 'keyboard') {
            return;
        }

        super.show(delay);

        if (this.relativeToPointer) {
            this.applyRelativeToPointer();
        }
    }

    /**
     * method allows to show the tooltip relative to the element
     * Use this approach when it is not possible to define a trigger in the template.
     *
     * For example:
     * const tooltip = new KbqTooltipTrigger();
     * tooltip.showForElement(element);
     */
    showForElement(element: HTMLElement) {
        this.show();
        this.strategy.setOrigin(element);
    }

    updateData() {
        if (!this.instance) {
            return;
        }

        this.instance.content = this.content;
        this.instance.context = this.context && { $implicit: this.context };
        this.instance.arrow = this.arrow;
        this.instance.offset = this.offset;
        this.instance.detectChanges();
        this.updatePosition(true);
    }

    closingActions() {
        return merge(
            this.hasClickInTrigger ? this.overlayRef!.outsidePointerEvents() : EMPTY,
            this.overlayRef!.detachments()
        );
    }

    getOverlayHandleComponentType(): Type<KbqTooltipComponent> {
        return KbqTooltipComponent;
    }

    updateClassMap(newPlacement: string = this.placement) {
        if (!this.instance) {
            return;
        }

        this.instance.updateClassMap(POSITION_TO_CSS_MAP[newPlacement], `${this.customClass} ${this.color}`, {
            modifier: this.modifier
        });
        this.instance.markForCheck();
    }

    protected applyRelativeToPointer() {
        if (
            !this.strategy ||
            ![PopUpPlacements.Top, PopUpPlacements.Bottom].includes(this.placement as PopUpPlacements) ||
            this.triggerName !== 'mouseenter'
        ) {
            this.resetOrigin();

            return;
        }

        const triggerRects = this.elementRef.nativeElement.getBoundingClientRect();
        const point: Point = { x: 0, y: 0 };

        this.placementPriority = null;

        if (this.placement === PopUpPlacements.Top) {
            point.x = this.mouseEvent!.x;
            point.y = triggerRects.y;
        } else if (this.placement === PopUpPlacements.Bottom) {
            point.x = this.mouseEvent!.x;
            point.y = triggerRects.y + triggerRects.height;
        }

        this.strategy.setOrigin(point);
    }
}

@Directive({
    selector: '[kbqWarningTooltip]',
    exportAs: 'kbqWarningTooltip',
    host: {
        '[class.kbq-tooltip_open]': 'isOpen',

        '(keydown)': 'keydownHandler($event)',
        '(touchend)': 'touchendHandler()'
    }
})
export class KbqWarningTooltipTrigger extends KbqTooltipTrigger {
    @Input('kbqWarningTooltip')
    get content(): string | TemplateRef<any> {
        return this._content;
    }

    set content(content: string | TemplateRef<any>) {
        this._content = content;

        this.updateData();
    }

    protected modifier: TooltipModifier = TooltipModifier.Warning;
}

@Directive({
    selector: '[kbqExtendedTooltip]',
    exportAs: 'kbqExtendedTooltip',
    host: {
        '[class.kbq-tooltip_open]': 'isOpen',

        '(keydown)': 'keydownHandler($event)',
        '(touchend)': 'touchendHandler()'
    }
})
export class KbqExtendedTooltipTrigger extends KbqTooltipTrigger {
    /** @docs-private */
    protected _color = KbqComponentColors.ContrastFade;

    @Input('kbqExtendedTooltip')
    get content(): string | TemplateRef<any> {
        return this._content;
    }

    set content(content: string | TemplateRef<any>) {
        this._content = content;

        this.updateData();
    }

    @Input('kbqTooltipHeader')
    get header(): string | TemplateRef<any> {
        return this._header;
    }

    set header(header: string | TemplateRef<any>) {
        this._header = header;

        this.updateData();
    }

    private _header: string | TemplateRef<any>;

    protected modifier: TooltipModifier = TooltipModifier.Extended;

    updateData() {
        if (!this.instance) {
            return;
        }

        super.updateData();
        this.instance.header = this.header;
    }
}

import { FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Overlay, OverlayConfig, ScrollDispatcher, ScrollStrategy } from '@angular/cdk/overlay';
import {
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
    OnDestroy,
    Optional,
    Output,
    TemplateRef,
    Type,
    ViewContainerRef,
    ViewEncapsulation,
} from '@angular/core';
import {
    KbqComponentColors,
    KbqPopUp,
    KbqPopUpTrigger,
    POSITION_TO_CSS_MAP,
    PopUpPlacements,
    PopUpTriggers,
} from '@koobiq/components/core';
import { EMPTY, merge } from 'rxjs';
import { kbqTooltipAnimations } from './tooltip.animations';

export enum TooltipModifier {
    Default = 'default',
    Warning = 'warning',
    Extended = 'extended',
}

export const KBQ_TOOLTIP_OPEN_TIME = new InjectionToken<() => ScrollStrategy>('kbq-tooltip-open-time');

/** @docs-private */
export const KBQ_TOOLTIP_OPEN_TIME_PROVIDER = {
    provide: KBQ_TOOLTIP_OPEN_TIME,
    useValue: { value: 0 },
};

export const MIN_TIME_FOR_DELAY = 2000;

@Component({
    selector: 'kbq-tooltip-component',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.scss'],
    animations: [kbqTooltipAnimations.tooltipState],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [KBQ_TOOLTIP_OPEN_TIME_PROVIDER],
})
export class KbqTooltipComponent extends KbqPopUp {
    prefix = 'kbq-tooltip';

    constructor(
        changeDetectorRef: ChangeDetectorRef,
        @Inject(KBQ_TOOLTIP_OPEN_TIME) private openTime,
    ) {
        super(changeDetectorRef);
    }

    show(delay: number) {
        if (!this.content) {
            return;
        }

        // tslint:disable-next-line:no-magic-numbers
        super.show(Date.now() - this.openTime.value < MIN_TIME_FOR_DELAY ? 0 : delay);

        this.openTime.value = Date.now();
    }

    updateClassMap(placement: string, customClass: string, { modifier }) {
        const classMap = {
            [`${this.prefix}_${modifier}`]: true,
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
    useFactory: kbqTooltipScrollStrategyFactory,
};

@Directive({
    selector: '[kbqTooltip]',
    exportAs: 'kbqTooltip',
    host: {
        '[class.kbq-tooltip_open]': 'isOpen',

        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()',
    },
})
export class KbqTooltipTrigger extends KbqPopUpTrigger<KbqTooltipComponent> implements OnDestroy {
    @Input('kbqVisible')
    get tooltipVisible(): boolean {
        return this.visible;
    }

    set tooltipVisible(value: boolean) {
        super.updateVisible(value);
    }

    @Input('kbqPlacement')
    get tooltipPlacement(): PopUpPlacements {
        return this.placement;
    }

    set tooltipPlacement(value: PopUpPlacements) {
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

    // tslint:disable-next-line:naming-convention
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

    @Input('kbqTooltipColor')
    get color(): string {
        return `kbq-${this._color}`;
    }

    set color(value: KbqComponentColors | string) {
        this._color = value || KbqComponentColors.Contrast;
    }

    private _color: KbqComponentColors | string = KbqComponentColors.Contrast;

    @Output('kbqPlacementChange') placementChange = new EventEmitter();

    @Output('kbqVisibleChange') visibleChange = new EventEmitter<boolean>();

    private get hasClickInTrigger(): boolean {
        return this.trigger.includes(PopUpTriggers.Click);
    }

    protected originSelector = '.kbq-tooltip';

    protected overlayConfig: OverlayConfig = {
        panelClass: 'kbq-tooltip-panel',
    };

    protected modifier: TooltipModifier = TooltipModifier.Default;

    constructor(
        overlay: Overlay,
        elementRef: ElementRef,
        ngZone: NgZone,
        scrollDispatcher: ScrollDispatcher,
        hostView: ViewContainerRef,
        @Inject(KBQ_TOOLTIP_SCROLL_STRATEGY) scrollStrategy,
        @Optional() direction: Directionality,
        protected focusMonitor: FocusMonitor,
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction);

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
    }

    updateData() {
        if (!this.instance) {
            return;
        }

        this.instance.content = this.content;
        this.instance.detectChanges();
    }

    closingActions() {
        return merge(
            this.hasClickInTrigger ? this.overlayRef!.outsidePointerEvents() : EMPTY,
            this.overlayRef!.detachments(),
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
            modifier: this.modifier,
        });
        this.instance.markForCheck();
    }
}

@Directive({
    selector: '[kbqWarningTooltip]',
    exportAs: 'kbqWarningTooltip',
    host: {
        '[class.kbq-tooltip_open]': 'isOpen',

        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()',
    },
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

    constructor(
        overlay: Overlay,
        elementRef: ElementRef,
        ngZone: NgZone,
        scrollDispatcher: ScrollDispatcher,
        hostView: ViewContainerRef,
        @Inject(KBQ_TOOLTIP_SCROLL_STRATEGY) scrollStrategy,
        @Optional() direction: Directionality,
        focusMonitor: FocusMonitor,
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction, focusMonitor);
    }
}

@Directive({
    selector: '[kbqExtendedTooltip]',
    exportAs: 'kbqExtendedTooltip',
    host: {
        '[class.kbq-tooltip_open]': 'isOpen',

        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()',
    },
})
export class KbqExtendedTooltipTrigger extends KbqTooltipTrigger {
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

    constructor(
        overlay: Overlay,
        elementRef: ElementRef,
        ngZone: NgZone,
        scrollDispatcher: ScrollDispatcher,
        hostView: ViewContainerRef,
        @Inject(KBQ_TOOLTIP_SCROLL_STRATEGY) scrollStrategy,
        @Optional() direction: Directionality,
        focusMonitor: FocusMonitor,
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction, focusMonitor);
    }

    updateData() {
        if (!this.instance) {
            return;
        }

        super.updateData();
        this.instance.header = this.header;
    }
}

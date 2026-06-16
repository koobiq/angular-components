import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Point } from '@angular/cdk/drag-drop';
import { Overlay, OverlayConfig, ScrollStrategy } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    InjectionToken,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    Renderer2,
    SimpleChanges,
    TemplateRef,
    Type,
    ViewChild,
    ViewEncapsulation,
    WritableSignal,
    booleanAttribute,
    effect,
    inject,
    input,
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

export const KBQ_TOOLTIP_OPEN_TIME = new InjectionToken<{ value: number }>('kbq-tooltip-open-time');

/** @docs-private */
export const KBQ_TOOLTIP_OPEN_TIME_PROVIDER = {
    provide: KBQ_TOOLTIP_OPEN_TIME,
    useValue: { value: 0 }
};

export const MIN_TIME_FOR_DELAY = 2000;

@Component({
    selector: 'kbq-tooltip-component',
    imports: [
        NgTemplateOutlet
    ],
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.scss', './tooltip-tokens.scss'],
    providers: [KBQ_TOOLTIP_OPEN_TIME_PROVIDER],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [kbqTooltipAnimations.tooltipState]
})
export class KbqTooltipComponent extends KbqPopUp {
    private openTime = inject(KBQ_TOOLTIP_OPEN_TIME);

    prefix = 'kbq-tooltip';

    @ViewChild('tooltip') elementRef: ElementRef;

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
    host: {
        '[class.kbq-tooltip_open]': 'isOpen',

        '(keydown)': 'keydownHandler($event)',
        '(touchend)': 'touchendHandler()'
    },
    exportAs: 'kbqTooltip'
})
export class KbqTooltipTrigger
    extends KbqPopUpTrigger<KbqTooltipComponent>
    implements AfterViewInit, OnChanges, OnDestroy
{
    protected scrollStrategy: () => ScrollStrategy = inject(KBQ_TOOLTIP_SCROLL_STRATEGY);
    protected parentPopup = inject<KbqParentPopup>(KBQ_PARENT_POPUP, { optional: true });
    protected focusMonitor: FocusMonitor = inject(FocusMonitor);
    /** @docs-private */
    protected renderer: Renderer2 = inject(Renderer2);

    /**
     * Input for controlling the disabled state of a component.
     *
     * The input expects a component containing `disabledSignal` property, which is
     * a writable signal emitting boolean values.
     */
    readonly forDisabledComponent = input<Record<'disabledSignal', WritableSignal<boolean>>>();

    /**
     * Determines whether pointer events should be ignored on tooltips.
     *
     * When set to `true`, tooltip elements will not receive pointer events,
     * allowing interactions to pass through to underlying elements.
     * Defaults to `true`.
     */
    readonly ignoreTooltipPointerEvents = input<boolean>(true);

    /**
     * Changes hiding behavior. By default, tooltip is hidden on mouseleave from trigger.
     * Setting hideWithTimeout to true will delay tooltip hiding and will not hide when the mouse moves from trigger
     * to tooltip.
     */
    // TODO: Skipped for migration because:
    //  This input overrides a field from a superclass, while the superclass field
    //  is not migrated.
    @Input({ transform: booleanAttribute }) hideWithTimeout: boolean = false;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqVisible')
    get tooltipVisible(): boolean {
        return this.visible;
    }

    set tooltipVisible(value: boolean) {
        super.updateVisible(value);
    }

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPlacement')
    get tooltipPlacement(): KbqPopUpPlacementValues {
        return this.placement;
    }

    /**
     * Positions the tooltip relative to the mouse cursor. Only available for top and bottom kbqPlacement.
     * Does not work with kbqPlacementPriority.
     */
    // TODO: Skipped for migration because:
    //  Class of this input is manually instantiated. This is discouraged and prevents
    //  migration.
    @Input({ alias: 'kbqRelativeToPointer', transform: booleanAttribute }) relativeToPointer: boolean = false;

    set tooltipPlacement(value: KbqPopUpPlacementValues) {
        super.updatePlacement(value);
    }

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPlacementPriority')
    get tooltipPlacementPriority() {
        return this.placementPriority;
    }

    set tooltipPlacementPriority(value) {
        super.updatePlacementPriority(value);
    }

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqTooltip')
    get content(): string | TemplateRef<any> {
        return this._content;
    }

    set content(content: string | TemplateRef<any>) {
        this._content = content;

        this.updateData();
    }

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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

    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input('kbqEnterDelay') enterDelay = 400;
    // TODO: Skipped for migration because:
    //  This input overrides a field from a superclass, while the superclass field
    //  is not migrated.
    @Input('kbqLeaveDelay') leaveDelay = 0;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqTooltipContext')
    get context() {
        return this._context;
    }

    set context(ctx) {
        this._context = ctx;
        this.updateData();
    }

    private _context: any = null;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqTooltipColor')
    get color(): string {
        return `kbq-${this._color}`;
    }

    set color(value: KbqComponentColors | string) {
        this._color = value || KbqComponentColors.Contrast;
    }

    private _color: KbqComponentColors | string = KbqComponentColors.Contrast;

    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ alias: 'kbqTooltipArrow', transform: booleanAttribute }) arrow: boolean = false;
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ alias: 'kbqTooltipOffset', transform: numberAttribute }) offset: number | null = null;

    @Output('kbqPlacementChange') readonly placementChange = new EventEmitter();

    @Output('kbqVisibleChange') readonly visibleChange = new EventEmitter<boolean>();

    private get hasClickInTrigger(): boolean {
        return this.trigger.includes(PopUpTriggers.Click);
    }

    protected originSelector = '.kbq-tooltip';

    protected overlayConfig: OverlayConfig = {
        panelClass: ['kbq-tooltip-panel']
    };

    /**
     * Visual variant of the tooltip. Accepts `'default'` | `'warning'` | `'extended'`.
     * Replaces the removed `KbqWarningTooltipTrigger` and `KbqExtendedTooltipTrigger`
     * subclasses — to render a warning tooltip use `kbqTooltipModifier="warning"`,
     * and `kbqTooltipModifier="extended"` for the extended variant (combine with `kbqTooltipHeader`).
     */
    // TODO: Skipped for migration because:
    //  Class of this input is manually instantiated. This is discouraged and prevents
    //  migration.
    @Input('kbqTooltipModifier') modifier: TooltipModifier | `${TooltipModifier}` = TooltipModifier.Default;

    /**
     * Header text or template, rendered above the tooltip content. Only meaningful with
     * `kbqTooltipModifier="extended"`. Replaces the removed `KbqExtendedTooltipTrigger.header`.
     */
    // TODO: Skipped for migration because:
    //  Class of this input is manually instantiated. This is discouraged and prevents
    //  migration.
    @Input('kbqTooltipHeader') header: string | TemplateRef<any>;

    /**
     * The old `KbqWarningTooltipTrigger` / `KbqExtendedTooltipTrigger` subclasses had
     * setters on their content/header inputs that pushed updates into the open tooltip.
     * Now that `modifier` and `header` are plain `@Input` fields on this base class,
     * we need to mirror that reactivity manually — without it, changing the inputs
     * while a tooltip is open silently leaves the overlay showing stale data until
     * the next show/hide cycle.
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (!this.instance) return;

        if (changes.modifier && !changes.modifier.firstChange) {
            this.updateClassMap();
        }

        if (changes.header && !changes.header.firstChange) {
            this.updateData();
        }
    }

    constructor() {
        super();

        effect(() => {
            if (!this.forDisabledComponent()) return;

            const disabled = this.forDisabledComponent()!.disabledSignal();

            if (disabled) {
                this.renderer.setAttribute(this.getNativeElement(), 'tabindex', '0');
                this.renderer.setStyle(this.getNativeElement(), 'outline-color', 'var(--kbq-states-line-focus-theme)');
            } else {
                this.renderer.setAttribute(this.getNativeElement(), 'tabindex', '-1');
            }

            this.disabled = !disabled;
        });
    }

    ngAfterViewInit(): void {
        this.parentPopup?.closedStream.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.hide());

        this.focusMonitor.monitor(this.elementRef.nativeElement);

        if (this.ignoreTooltipPointerEvents() && Array.isArray(this.overlayConfig.panelClass)) {
            this.overlayConfig.panelClass.push('cdk-overlay-pane_ignore-pointer-events');
        }
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

    /** method allows to show the tooltip relative to the given mouse event. */
    showForMouseEvent(event: MouseEvent) {
        if (!(event.currentTarget instanceof HTMLElement)) return;

        this.triggerName = 'mouseenter';
        this.mouseEvent = event;
        this.setExternalNativeElement(event.currentTarget);

        super.show();

        this.applyRelativeToPointer();
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
        this.instance.header = this.header;
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

        const triggerRects = this.getNativeElement().getBoundingClientRect();
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

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
import { KBQ_TOOLTIP_SINGLE_INSTANCE_DEFAULT, KbqExclusiveTooltip, KbqTooltipRegistry } from './tooltip-registry';
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

/**
 * Triggers that make a tooltip part of the "only one tooltip is visible at a time" group.
 *
 * Values that match none of them (`manual`, `none`, …) bind no listeners at all — that is how the
 * imperatively driven validation tooltips are configured, and they are expected to stay pinned while
 * the user keeps interacting elsewhere.
 */
const INTERACTIVE_TRIGGERS = [
    PopUpTriggers.Hover,
    PopUpTriggers.Focus,
    PopUpTriggers.Click,
    PopUpTriggers.Keydown
];

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

/**
 * Trigger directive that shows a `KbqTooltipComponent` for its host element. Extends `KbqPopUpTrigger` with
 * tooltip-specific inputs (content, placement, color, arrow, enter/leave delays, modifier and header) and
 * behavior such as opening on keyboard focus only and positioning relative to the mouse cursor.
 */
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
    implements AfterViewInit, OnChanges, OnDestroy, KbqExclusiveTooltip
{
    /** Registry holding the single tooltip that is currently visible. */
    private readonly tooltipRegistry = inject(KbqTooltipRegistry);

    /** @docs-private */
    protected scrollStrategy: () => ScrollStrategy = inject(KBQ_TOOLTIP_SCROLL_STRATEGY);
    /** @docs-private */
    protected parentPopup = inject<KbqParentPopup>(KBQ_PARENT_POPUP, { optional: true });
    /** @docs-private */
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
     * Whether the tooltip takes part in the "only one tooltip is visible at a time" group: showing it
     * hides the previously visible tooltip, and it is hidden when another tooltip is shown.
     *
     * Defaults to `true`; the default can be changed application-wide with the
     * `KBQ_TOOLTIP_SINGLE_INSTANCE_DEFAULT` token.
     *
     * Tooltips without an interactive `kbqTrigger` (`manual`, `none`, …) never take part in the group,
     * regardless of this input — they are shown imperatively and are expected to stay pinned.
     */
    readonly singleInstance = input<boolean, unknown>(inject(KBQ_TOOLTIP_SINGLE_INSTANCE_DEFAULT), {
        alias: 'kbqTooltipSingleInstance',
        transform: booleanAttribute
    });

    /**
     * Changes hiding behavior. By default, tooltip is hidden on mouseleave from trigger.
     * Setting hideWithTimeout to true will delay tooltip hiding and will not hide when the mouse moves from trigger
     * to tooltip.
     */
    // TODO: Skipped for migration because:
    //  This input overrides a field from a superclass, while the superclass field
    //  is not migrated.
    @Input({ transform: booleanAttribute }) hideWithTimeout: boolean = false;

    /** Input (`kbqVisible`) that programmatically shows or hides the tooltip; reflects the current `visible` state. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqVisible')
    get tooltipVisible(): boolean {
        return this.visible;
    }

    set tooltipVisible(value: boolean) {
        super.updateVisible(value);
    }

    /** Input (`kbqPlacement`) that sets the tooltip placement relative to its trigger; reflects the current `placement`. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPlacement')
    get tooltipPlacement(): KbqPopUpPlacementValues {
        return this.placement;
    }

    set tooltipPlacement(value: KbqPopUpPlacementValues) {
        super.updatePlacement(value);
    }

    /**
     * Positions the tooltip relative to the mouse cursor. Only available for top and bottom kbqPlacement.
     * Does not work with kbqPlacementPriority.
     */
    // TODO: Skipped for migration because:
    //  Class of this input is manually instantiated. This is discouraged and prevents
    //  migration.
    @Input({ alias: 'kbqRelativeToPointer', transform: booleanAttribute }) relativeToPointer: boolean = false;

    /** Input (`kbqPlacementPriority`) that sets the ordered fallback placements; reflects the current `placementPriority`. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPlacementPriority')
    get tooltipPlacementPriority() {
        return this.placementPriority;
    }

    set tooltipPlacementPriority(value) {
        super.updatePlacementPriority(value);
    }

    /** Input (`kbqTooltip`) with the tooltip content — a string or a template. Updating it refreshes an open tooltip. */
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

    /** Input (`kbqTooltipDisabled`) controlling whether the tooltip is disabled; setting it to `true` hides it. */
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

    /** Input (`kbqEnterDelay`) — delay in milliseconds before the tooltip is shown. Defaults to `400`. */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input('kbqEnterDelay') enterDelay = 400;
    /** Input (`kbqLeaveDelay`) — delay in milliseconds before the tooltip is hidden. Defaults to `0`. */
    // TODO: Skipped for migration because:
    //  This input overrides a field from a superclass, while the superclass field
    //  is not migrated.
    @Input('kbqLeaveDelay') leaveDelay = 0;

    /** Input (`kbqTrigger`) with the comma-separated trigger events. An empty value resets to hover + focus and rebinds listeners. */
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

    /** Backing field for `trigger`; defaults to hover + focus. */
    protected _trigger = `${PopUpTriggers.Hover}, ${PopUpTriggers.Focus}`;

    /** Input (`kbqTooltipClass`) with an extra CSS class applied to the tooltip; updating it refreshes the class map. */
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

    /** Input (`kbqTooltipContext`) with the context object passed to a template tooltip; updating it refreshes the open tooltip. */
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

    /** Backing field for `context`. */
    private _context: any = null;

    /** Input (`kbqTooltipColor`) with the tooltip color theme; the getter returns the `kbq-`-prefixed CSS class. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqTooltipColor')
    get color(): string {
        return `kbq-${this._color}`;
    }

    set color(value: KbqComponentColors | string) {
        this._color = value || KbqComponentColors.Contrast;
    }

    /** Backing field for `color`; defaults to `KbqComponentColors.Contrast`. */
    private _color: KbqComponentColors | string = KbqComponentColors.Contrast;

    /** Input (`kbqTooltipArrow`) — whether to render the tooltip's arrow/pointer. Defaults to `false`. */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ alias: 'kbqTooltipArrow', transform: booleanAttribute }) arrow: boolean = false;
    /** Input (`kbqTooltipOffset`) — distance in pixels between the tooltip and its trigger; `null` uses the default. */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ alias: 'kbqTooltipOffset', transform: numberAttribute }) offset: number | null = null;

    /** Output (`kbqPlacementChange`) that emits the new placement whenever the tooltip repositions. */
    @Output('kbqPlacementChange') readonly placementChange = new EventEmitter();

    /** Output (`kbqVisibleChange`) that emits when the tooltip's visibility changes. */
    @Output('kbqVisibleChange') readonly visibleChange = new EventEmitter<boolean>();

    /** Whether the configured trigger list includes the `click` trigger. */
    private get hasClickInTrigger(): boolean {
        return this.trigger.includes(PopUpTriggers.Click);
    }

    /** @docs-private */
    protected originSelector = '.kbq-tooltip';

    /** @docs-private */
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

    /**
     * Whether this tooltip takes part in the "only one tooltip is visible at a time" group.
     *
     * Read through the `trigger` getter on purpose: `KbqTitleDirective` always reports `hover`, so title
     * tooltips participate, while `kbqValidationTooltip` consumers (datepicker, timepicker, inline-edit)
     * assign `trigger = 'manual'` and therefore stay out of the group.
     */
    private get participatesInSingleInstance(): boolean {
        return this.singleInstance() && INTERACTIVE_TRIGGERS.some((name) => this.trigger.includes(name));
    }

    /**
     * Sets up an effect that mirrors a `forDisabledComponent`'s disabled signal: when that component is disabled it
     * makes the host focusable (so the tooltip can still be triggered) and enables the tooltip, otherwise disables it.
     *
     * Also joins the "only one tooltip is visible at a time" group. Both the subscription and the teardown live
     * here rather than in `ngAfterViewInit`/`ngOnDestroy` because several subclasses override those hooks:
     * `KbqTitleDirective` and `KbqEllipsisCenterDirective` skip `super.ngAfterViewInit()`, and `KbqPasswordToggle`
     * skips `super` in both hooks entirely. `destroyRef` additionally covers a trigger destroyed while its
     * tooltip is still visible — that path disposes the overlay without emitting `visibleChange(false)`.
     */
    constructor() {
        super();

        this.visibleChange.pipe(takeUntilDestroyed()).subscribe((visible) => {
            if (visible) {
                if (this.participatesInSingleInstance) {
                    this.tooltipRegistry.setVisible(this);
                }
            } else {
                this.tooltipRegistry.clearVisible(this);
            }
        });

        this.destroyRef.onDestroy(() => this.tooltipRegistry.clearVisible(this));

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

    /**
     * Hides the tooltip when a parent pop-up closes, starts focus monitoring on the host, and—when
     * `ignoreTooltipPointerEvents` is set—adds the panel class that makes the tooltip ignore pointer events.
     */
    ngAfterViewInit(): void {
        this.parentPopup?.closedStream.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.hide());

        this.focusMonitor.monitor(this.elementRef.nativeElement);

        if (this.ignoreTooltipPointerEvents() && Array.isArray(this.overlayConfig.panelClass)) {
            this.overlayConfig.panelClass.push('cdk-overlay-pane_ignore-pointer-events');
        }
    }

    /** Stops focus monitoring on the host element and runs the base-class teardown. */
    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);

        super.ngOnDestroy();
    }

    /**
     * Shows the tooltip after `delay` ms. Suppresses showing on a focus trigger that did not originate from
     * the keyboard, and applies cursor-relative positioning when `relativeToPointer` is enabled.
     */
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
     * Hides the tooltip because another tooltip became visible.
     *
     * Goes straight to the pop-up instead of `hide()`: `hide()` silently no-ops when the last recorded
     * `triggerName` is `mouseleave` and the pop-up itself is hovered. Hiding through the instance keeps
     * `visibleChange(false)` firing, so `isOpen`, `kbqVisibleChange` and the `kbqVisible` input stay in sync.
     * Does nothing when the tooltip is already detached or when closing is prevented.
     * @docs-private */
    hideAsInactive(): void {
        if (this.preventClose) return;

        this.ngZone.run(() => this.instance?.hide(0));
    }

    /** method allows to show the tooltip relative to the given mouse event.
     * @docs-private */
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
     * @docs-private */
    showForElement(element: HTMLElement) {
        this.show();
        this.strategy.setOrigin(element);
    }

    /** @docs-private */
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

    /** @docs-private */
    closingActions() {
        return merge(
            this.hasClickInTrigger ? this.overlayRef!.outsidePointerEvents() : EMPTY,
            this.overlayRef!.detachments()
        );
    }

    /** @docs-private */
    getOverlayHandleComponentType(): Type<KbqTooltipComponent> {
        return KbqTooltipComponent;
    }

    /** @docs-private */
    updateClassMap(newPlacement: string = this.placement) {
        if (!this.instance) {
            return;
        }

        this.instance.updateClassMap(POSITION_TO_CSS_MAP[newPlacement], `${this.customClass} ${this.color}`, {
            modifier: this.modifier
        });
        this.instance.markForCheck();
    }

    /** @docs-private */
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

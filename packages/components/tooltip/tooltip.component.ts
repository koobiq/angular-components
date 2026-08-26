import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Point } from '@angular/cdk/drag-drop';
import { Overlay, OverlayConfig, OverlayRef, ScrollStrategy } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    Injectable,
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
    ESCAPE,
    KBQ_PARENT_POPUP,
    KBQ_SIBLING_POPUP,
    KbqComponentColors,
    KbqEnumValues,
    KbqParentPopup,
    KbqPopUp,
    KbqPopUpPlacementValues,
    KbqPopUpTrigger,
    KbqSiblingPopup,
    POSITION_TO_CSS_MAP,
    PopUpPlacements,
    PopUpTriggers,
    applyPopupMargins
} from '@koobiq/components/core';
import { EMPTY, merge } from 'rxjs';
import { filter } from 'rxjs/operators';
import { KBQ_TOOLTIP_SINGLE_INSTANCE_DEFAULT, KbqExclusiveTooltip, KbqTooltipRegistry } from './tooltip-registry';
import { kbqTooltipAnimations } from './tooltip.animations';

export enum TooltipModifier {
    Default = 'default',
    Warning = 'warning',
    Extended = 'extended'
}

/**
 * @deprecated Replaced by {@link KbqTooltipDelayTracker}, which owns the shared timestamp behind a service
 * instead of a mutable `useValue` object. The tooltip no longer reads this token; providing it has no effect.
 */
export const KBQ_TOOLTIP_OPEN_TIME = new InjectionToken<{ value: number }>('kbq-tooltip-open-time');

/**
 * @deprecated Replaced by {@link KbqTooltipDelayTracker}. Providing it has no effect.
 * @docs-private
 */
export const KBQ_TOOLTIP_OPEN_TIME_PROVIDER = {
    provide: KBQ_TOOLTIP_OPEN_TIME,
    useValue: { value: 0 }
};

/** Default length of the window during which a following tooltip is shown without its enter delay. */
export const MIN_TIME_FOR_DELAY = 2000;

/**
 * Length in milliseconds of the window during which a tooltip shown right after another one appears
 * instantly. Defaults to {@link MIN_TIME_FOR_DELAY}.
 */
export const KBQ_TOOLTIP_INSTANT_SHOW_WINDOW = new InjectionToken<number>('kbq-tooltip-instant-show-window', {
    providedIn: 'root',
    factory: () => MIN_TIME_FOR_DELAY
});

/**
 * Remembers when a tooltip was last shown, so that moving between neighbouring triggers does not replay the
 * enter delay for every one of them: the first tooltip waits `kbqEnterDelay`, the ones following it within
 * {@link KBQ_TOOLTIP_INSTANT_SHOW_WINDOW} appear instantly.
 *
 * Application-wide by design — the behavior is part of the component's documented delay rules.
 */
@Injectable({ providedIn: 'root' })
export class KbqTooltipDelayTracker {
    private readonly instantShowWindow = inject(KBQ_TOOLTIP_INSTANT_SHOW_WINDOW);

    /** Timestamp of the last shown tooltip, or `null` while no tooltip has been shown recently. */
    private lastShownAt: number | null = null;

    /** Whether the tooltip that is about to be shown should skip its enter delay. */
    shouldSkipEnterDelay(): boolean {
        return this.lastShownAt !== null && Date.now() - this.lastShownAt < this.instantShowWindow;
    }

    /** Records that a tooltip has just been shown. */
    markShown(): void {
        this.lastShownAt = Date.now();
    }

    /** Forgets the last shown tooltip, so the next one appears with its full enter delay. */
    reset(): void {
        this.lastShownAt = null;
    }
}

/** Source of the unique ids that link a tooltip to the `aria-describedby` of its trigger. */
let nextTooltipUniqueId = 0;

@Component({
    selector: 'kbq-tooltip-component',
    imports: [
        NgTemplateOutlet
    ],
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.scss', './tooltip-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [kbqTooltipAnimations.tooltipState]
})
export class KbqTooltipComponent extends KbqPopUp {
    private readonly delayTracker = inject(KbqTooltipDelayTracker);

    prefix = 'kbq-tooltip';

    /** Id rendered on the tooltip element; the trigger points its `aria-describedby` at it. */
    id: string = `kbq-tooltip-${nextTooltipUniqueId++}`;

    @ViewChild('tooltip') elementRef: ElementRef;

    show(delay: number) {
        if (!this.content) {
            return;
        }

        super.show(this.delayTracker.shouldSkipEnterDelay() ? 0 : delay);

        this.applyOffset();

        this.delayTracker.markShown();
    }

    /**
     * Applies `offset` as the gap between the tooltip and its trigger. Called both on show and whenever the
     * trigger pushes new data, so that changing `kbqTooltipOffset` on an open tooltip actually moves it.
     */
    applyOffset(): void {
        if (this.offset === null) return;

        applyPopupMargins(this.renderer, this.elementRef.nativeElement, this.prefix, `${this.offset}px`);
    }

    updateClassMap(placement: string, customClass: string, { modifier }: { modifier: KbqEnumValues<TooltipModifier> }) {
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

/**
 * DOM events that mean the user has left the trigger, releasing a tooltip muted by a pop-up on the same
 * element. Both are bound by `KbqPopUpTrigger.initListeners` whenever the matching show trigger is bound.
 */
const RELEASE_TRIGGERS = ['mouseleave', 'blur'];

/**
 * Focus origins a focus-triggered tooltip opens for. Everything but `keyboard` is excluded on purpose: a
 * pointer user gets the tooltip from the hover trigger, and showing it again on the focus a click leaves
 * behind makes it linger after the pointer has moved on. `program` cannot be admitted either, because CDK
 * reports it whenever it fails to attribute a focus — including the focus that follows a click outside its
 * detection window — so admitting it would re-open exactly the case above. Focus the application moves on
 * purpose still opens the tooltip: the repo convention is `focusVia(element, 'keyboard')`, which reports
 * `keyboard`.
 */
const FOCUS_ORIGINS_THAT_SHOW: FocusOrigin[] = ['keyboard'];

/** Base panel class of the tooltip overlay. */
const TOOLTIP_PANEL_CLASS = 'kbq-tooltip-panel';

/** Panel class that makes the tooltip pane transparent to pointer events. */
const IGNORE_POINTER_EVENTS_PANEL_CLASS = 'cdk-overlay-pane_ignore-pointer-events';

export const KBQ_TOOLTIP_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>('kbq-tooltip-scroll-strategy', {
    providedIn: 'root',
    factory: () => kbqTooltipScrollStrategyFactory(inject(Overlay))
});

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

    private readonly injectedScrollStrategy: () => ScrollStrategy = inject(KBQ_TOOLTIP_SCROLL_STRATEGY);

    /**
     * Per-instance override for the scroll strategy, taking precedence over `KBQ_TOOLTIP_SCROLL_STRATEGY`
     * when set. An `@Input` rather than a DI override so it applies to this tooltip instance only, without
     * leaking into other `kbqTooltip`s nested inside the same host (DI overrides are visible to every
     * descendant in the element-injector tree, not just the element they're declared on).
     * @docs-private
     */
    readonly scrollStrategyOverride = input<(() => ScrollStrategy) | undefined>(undefined, {
        alias: 'kbqTooltipScrollStrategy'
    });

    /** Id of the tooltip element this trigger points its `aria-describedby` at while the tooltip is open. */
    private readonly tooltipId = `kbq-tooltip-${nextTooltipUniqueId++}`;

    /** @docs-private */
    protected get scrollStrategy(): () => ScrollStrategy {
        return this.scrollStrategyOverride() ?? this.injectedScrollStrategy;
    }
    /** @docs-private */
    protected parentPopup = inject<KbqParentPopup>(KBQ_PARENT_POPUP, { optional: true });
    /**
     * Pop-ups anchored to the very same element — a popover, a dropdown, a select and so on. Resolved with
     * `self` so a pop-up further up the tree (which the tooltip merely lives inside) is not picked up; that
     * case is covered by `parentPopup`.
     */
    private readonly siblingPopups: readonly KbqSiblingPopup[] =
        inject(KBQ_SIBLING_POPUP, { self: true, optional: true }) || [];
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
     * When set to `true`, the tooltip pane does not receive pointer events, so clicks and hovers pass through
     * to whatever is underneath it. Defaults to `false`, which keeps the tooltip hoverable: a user who needs
     * more time to read it — or who reads at high magnification, where the pointer often ends up over the
     * tooltip itself — can move the pointer onto it without it disappearing (WCAG 1.4.13 "Content on Hover").
     *
     * Set it to `true` for tooltips that float over other click targets, such as the overflow hints of a
     * scrolling option list.
     */
    readonly ignoreTooltipPointerEvents = input<boolean>(false);

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
    get content(): string | TemplateRef<unknown> {
        return this._content;
    }

    set content(content: string | TemplateRef<unknown>) {
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
        this.explicitlyDisabled = coerceBooleanProperty(value);
        this._disabled = this.explicitlyDisabled;

        if (this._disabled) {
            this.hide();
        }
    }

    /**
     * Value the consumer assigned to `kbqTooltipDisabled`, or `undefined` while the input was never set. It
     * makes the input win over the state `forDisabledComponent` derives, instead of the two fighting over
     * `_disabled` in whichever order they happen to run.
     */
    private explicitlyDisabled: boolean | undefined;

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
    get context(): unknown {
        return this._context;
    }

    set context(ctx: unknown) {
        this._context = ctx;
        this.updateData();
    }

    /** Backing field for `context`. */
    private _context: unknown = null;

    /** Input (`kbqTooltipColor`) with the tooltip color theme. Defaults to `KbqComponentColors.Contrast`. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqTooltipColor')
    get color(): KbqComponentColors | string {
        return this._color;
    }

    set color(value: KbqComponentColors | string) {
        this._color = value || KbqComponentColors.Contrast;
    }

    /** CSS class the current `color` maps to. */
    protected get colorClass(): string {
        return `kbq-${this._color}`;
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
    @Output('kbqPlacementChange') readonly placementChange = new EventEmitter<KbqPopUpPlacementValues>();

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
        panelClass: [TOOLTIP_PANEL_CLASS]
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
    @Input('kbqTooltipModifier') modifier: KbqEnumValues<TooltipModifier> = TooltipModifier.Default;

    /**
     * Header text or template, rendered above the tooltip content. Only meaningful with
     * `kbqTooltipModifier="extended"`. Replaces the removed `KbqExtendedTooltipTrigger.header`.
     */
    // TODO: Skipped for migration because:
    //  Class of this input is manually instantiated. This is discouraged and prevents
    //  migration.
    @Input('kbqTooltipHeader') header: string | TemplateRef<unknown>;

    /**
     * The old `KbqWarningTooltipTrigger` / `KbqExtendedTooltipTrigger` subclasses had
     * setters on their content/header inputs that pushed updates into the open tooltip.
     * Now that `modifier`, `header`, `arrow` and `offset` are plain `@Input` fields on this base class,
     * we need to mirror that reactivity manually — without it, changing the inputs
     * while a tooltip is open silently leaves the overlay showing stale data until
     * the next show/hide cycle.
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (!this.instance) return;

        if (changes.modifier && !changes.modifier.firstChange) {
            this.updateClassMap();
        }

        if (
            (changes.header && !changes.header.firstChange) ||
            (changes.arrow && !changes.arrow.firstChange) ||
            (changes.offset && !changes.offset.firstChange)
        ) {
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
        return this.singleInstance() && this.hasInteractiveTrigger;
    }

    /**
     * Whether `kbqTrigger` contains at least one user-driven event, i.e. the tooltip is not driven purely
     * imperatively. `manual`/`none` tooltips (the validation hints of datepicker, timepicker and inline-edit)
     * bind no listeners and are expected to stay pinned while the user keeps interacting elsewhere.
     */
    private get hasInteractiveTrigger(): boolean {
        return INTERACTIVE_TRIGGERS.some((name) => this.trigger.includes(name));
    }

    /**
     * Whether the tooltip is muted because a pop-up on the same element has taken over the anchor.
     *
     * Set when that pop-up opens and released only once the pointer or the focus genuinely leaves the host,
     * never on the pop-up closing. Both matter: a pop-up restores focus to its trigger when it closes (see
     * `KbqPopoverComponent.onEscape`), and removing its backdrop replays `mouseenter` on the trigger without
     * the pointer having moved — either would otherwise pop the tooltip up out of nowhere.
     */
    private mutedBySiblingPopup = false;

    /**
     * Origin of the last focus event on the host, cached from the `FocusMonitor` stream so the focus trigger
     * can tell a keyboard focus from the one a click leaves behind.
     */
    protected lastFocusOrigin: FocusOrigin = null;

    /**
     * Sets up an effect that mirrors a `forDisabledComponent`'s disabled signal: when that component is disabled it
     * makes the host focusable (so the tooltip can still be triggered) and enables the tooltip, otherwise disables it.
     *
     * Also joins the "only one tooltip is visible at a time" group, mutes the tooltip while a pop-up on the
     * same element is open, tracks the focus origin and keeps the trigger's `aria-describedby` in sync with the
     * open tooltip. All of this wiring lives here rather than in `ngAfterViewInit`/`ngOnDestroy` because
     * several subclasses override those hooks: `KbqTitleDirective` and `KbqEllipsisCenterDirective` skip
     * `super.ngAfterViewInit()`, and `KbqPasswordToggle` skips `super` in both hooks entirely. `destroyRef`
     * additionally covers a trigger destroyed while its tooltip is still visible — that path disposes the
     * overlay without emitting `visibleChange(false)`.
     */
    constructor() {
        super();

        merge(...this.siblingPopups.map(({ openedChange }) => openedChange))
            .pipe(
                filter(Boolean),
                // A tooltip shown imperatively (`manual`/`none`) is not competing for the anchor with the
                // user — it is pinned on purpose, like the validation hints of datepicker and timepicker.
                filter(() => this.hasInteractiveTrigger),
                takeUntilDestroyed()
            )
            .subscribe(() => {
                this.mutedBySiblingPopup = true;

                this.hideAsInactive();
            });

        // CDK dispatches the focus origin from a capture-phase listener on the document, so it is already
        // recorded by the time the trigger's own `focus` listener runs.
        this.focusMonitor
            .monitor(this.elementRef.nativeElement)
            .pipe(takeUntilDestroyed())
            .subscribe((origin) => (this.lastFocusOrigin = origin));

        this.visibleChange.pipe(takeUntilDestroyed()).subscribe((visible) => {
            if (visible) {
                this.describeTrigger();

                if (this.participatesInSingleInstance) {
                    this.tooltipRegistry.setVisible(this);
                }
            } else {
                this.undescribeTrigger();
                this.tooltipRegistry.clearVisible(this);
            }
        });

        this.destroyRef.onDestroy(() => {
            this.undescribeTrigger();
            this.stopListeningForEscape();
            this.tooltipRegistry.clearVisible(this);
        });

        effect(() => {
            const forDisabledComponent = this.forDisabledComponent();

            if (!forDisabledComponent) return;

            const disabled = forDisabledComponent.disabledSignal();
            const nativeElement = this.getNativeElement();

            if (disabled) {
                // The wrapped control drops out of the tab order once it is disabled, so the wrapper takes its
                // place — otherwise the explanation for why the control is unavailable is keyboard-unreachable.
                this.renderer.setAttribute(nativeElement, 'tabindex', '0');
                this.renderer.setAttribute(nativeElement, 'role', 'group');
                this.renderer.addClass(nativeElement, 'kbq-tooltip-trigger_for-disabled');
            } else {
                this.renderer.setAttribute(nativeElement, 'tabindex', '-1');
                this.renderer.removeAttribute(nativeElement, 'role');
                this.renderer.removeClass(nativeElement, 'kbq-tooltip-trigger_for-disabled');
            }

            // An explicit `kbqTooltipDisabled` binding wins: the wrapper only derives the state when the
            // consumer left the input alone.
            if (this.explicitlyDisabled === undefined) {
                this._disabled = !disabled;
            }
        });
    }

    /** Hides the tooltip when a parent pop-up closes. */
    ngAfterViewInit(): void {
        this.parentPopup?.closedStream.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.hide());
    }

    /** Stops focus monitoring on the host element and runs the base-class teardown. */
    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);

        super.ngOnDestroy();
    }

    /**
     * Shows the tooltip after `delay` ms. Suppresses showing while a pop-up on the same element holds the
     * anchor or on a focus trigger that did not originate from the keyboard, and applies cursor-relative
     * positioning when `relativeToPointer` is enabled.
     */
    show(delay: number = this.enterDelay) {
        if (this.mutedBySiblingPopup) {
            return;
        }

        // Checked before the overlay exists: `KbqTooltipComponent.show` bails on empty content, but by then
        // the trigger has already attached the pane, leaving an empty, invisible overlay latched open — and
        // `KbqPopUpTrigger.show` returns early for as long as it is there, so the tooltip never recovers.
        if (!this.content) {
            return;
        }

        // `isAttached` is checked directly, not just the `mutedBySiblingPopup` latch: `openedChange` can lag
        // it by a real delay — e.g. select/tree-select only emit it once their open CSS animation finishes,
        // and a sibling's own `hide()` can cancel a still-pending `show()` outright so it never emits at all
        // (KbqPopUp.show/hide, pop-up.ts). `isAttached` itself is guaranteed synchronous by the
        // `KbqSiblingPopup` contract, so checking it here closes that gap regardless of the cause. Gated by
        // `hasInteractiveTrigger` for the same reason as the constructor subscription: a `manual`/`none`
        // tooltip is driven imperatively and must not be muted by a sibling at all.
        if (this.hasInteractiveTrigger && this.siblingPopups.some(({ isAttached }) => isAttached)) {
            return;
        }

        if (this.triggerName === 'focus' && !FOCUS_ORIGINS_THAT_SHOW.includes(this.lastFocusOrigin)) {
            return;
        }

        super.show(delay);

        if (this.relativeToPointer) {
            this.applyRelativeToPointer();
        }
    }

    /**
     * Hides the tooltip after `delay` ms and, when the user has genuinely left the host, un-mutes a tooltip
     * that a pop-up on the same element had muted.
     *
     * `mouseleave` and `blur` are the release signals because the base class binds `hide` to both regardless
     * of whether the tooltip is currently visible. A pop-up that is still attached does not count: its
     * backdrop steals the hover from the trigger while the pointer stands still, and that `mouseleave` must
     * not be mistaken for the user leaving.
     */
    hide(delay: number = this.leaveDelay) {
        if (RELEASE_TRIGGERS.includes(this.triggerName) && !this.siblingPopups.some(({ isAttached }) => isAttached)) {
            this.mutedBySiblingPopup = false;
        }

        super.hide(delay);
    }

    /**
     * Hides the tooltip because something else took its place — another tooltip became visible, or a pop-up
     * anchored to the same element opened.
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

    /**
     * Shows the tooltip next to the cursor position of the given mouse event, anchoring it to the event's
     * `currentTarget` instead of the directive's own host element.
     *
     * Use it when the trigger cannot be declared in the template — for instance for a tooltip shared by the
     * cells of a virtualized table. The directive still has to be created in an injection context.
     */
    showForMouseEvent(event: MouseEvent) {
        if (!(event.currentTarget instanceof HTMLElement)) return;

        // The same guard `show()` carries, repeated because this path reaches `super.show()` directly and
        // would otherwise latch an empty pane open — with it attached, `KbqPopUpTrigger.show` returns early
        // and the tooltip never recovers, while the pane keeps swallowing the document keydown listener.
        if (!this.content) return;

        this.triggerName = 'mouseenter';
        this.mouseEvent = event;
        this.undescribeTrigger();
        this.setExternalNativeElement(event.currentTarget);

        super.show();

        // Re-anchoring an open tooltip has to move the description itself: the `visibleChange(true)` edge that
        // normally drives it is swallowed by `distinctUntilChanged` while the pop-up stays attached. A tooltip
        // that is not open yet is left to that edge, which describes the element anchored by then.
        if (this.isOpen) {
            this.describeTrigger();
        }

        this.applyRelativeToPointer();
    }

    /**
     * Shows the tooltip anchored to the given element instead of the directive's own host element.
     *
     * Use it when the trigger cannot be declared in the template. The directive still has to be created in an
     * injection context:
     *
     * ```ts
     * const tooltip = runInInjectionContext(injector, () => new KbqTooltipTrigger());
     * tooltip.showForElement(element);
     * ```
     *
     * Does nothing while the tooltip is disabled or has no content — there is no overlay to anchor then.
     */
    showForElement(element: HTMLElement) {
        this.show();

        if (!this.strategy) return;

        this.strategy.setOrigin(element);
    }

    /**
     * Replaces the CSS classes put on the tooltip's overlay pane.
     *
     * Exists for components that own a tooltip through `hostDirectives` instead of extending this class and
     * therefore cannot reach the protected overlay configuration (e.g. `KbqNavbarItem`).
     * @docs-private */
    setOverlayPanelClass(panelClass: string | string[]): void {
        this.overlayConfig.panelClass = panelClass;
    }

    /** @docs-private */
    updateData() {
        if (!this.instance) {
            return;
        }

        this.instance.id = this.tooltipId;
        this.instance.content = this.content;
        this.instance.header = this.header;
        // `!= null` rather than a truthy check: `0`, `''` and `false` are legitimate template contexts, and
        // dropping them left the template rendering the previous context instead.
        this.instance.context = this.context != null ? { $implicit: this.context } : null;
        this.instance.arrow = this.arrow;
        this.instance.offset = this.offset;
        this.instance.detectChanges();
        // The margins live on the rendered tooltip element, so re-applying them is the only way a changed
        // `kbqTooltipOffset` reaches an already open tooltip.
        this.instance.applyOffset();
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

        this.instance.updateClassMap(POSITION_TO_CSS_MAP[newPlacement], `${this.customClass} ${this.colorClass}`, {
            modifier: this.modifier
        });
        this.instance.markForCheck();
    }

    /**
     * Arms the `Escape` listener for as long as the tooltip overlay is attached, so that `Escape` dismisses
     * the tooltip.
     *
     * The inherited `keydownHandler` is a host binding on the trigger and therefore only fires while the
     * trigger itself has focus, which a hover-opened tooltip never has.
     * @docs-private
     */
    createOverlay(): OverlayRef {
        if (this.overlayRef) {
            return this.overlayRef;
        }

        // Rebuilt here rather than pushed into `overlayConfig` from a lifecycle hook: five subclasses skip
        // `super.ngAfterViewInit()`, and appending to the array made the class impossible to take back off.
        this.overlayConfig = { ...this.overlayConfig, panelClass: this.getPanelClasses() };

        const overlayRef = super.createOverlay();

        overlayRef
            .attachments()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.listenForEscape());
        overlayRef
            .detachments()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.stopListeningForEscape());

        return overlayRef;
    }

    /** Teardown of the document-level `Escape` listener, or `null` while the overlay is detached. */
    private unbindEscapeListener: (() => void) | null = null;

    /**
     * Binds a document-level `Escape` listener, outside the zone and at most once per attach.
     *
     * Deliberately not `overlayRef.keydownEvents()`: CDK hands each key to the last attached overlay that has
     * subscribers and stops there, without re-dispatching. A tooltip is by construction the last overlay
     * attached, so subscribing would make it swallow `Escape` for the modal, sidepanel, dropdown or inline
     * edit underneath it — including for the imperative tooltips that drop the key instead of acting on it.
     */
    private listenForEscape(): void {
        if (this.unbindEscapeListener) return;

        this.ngZone.runOutsideAngular(() => {
            this.unbindEscapeListener = this.renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
                // An imperatively driven tooltip (`manual`/`none`) is pinned on purpose — the validation hints
                // of datepicker, timepicker and inline-edit must survive an unrelated Escape.
                if (event.keyCode !== ESCAPE || !this.isOpen || !this.hasInteractiveTrigger) return;

                this.hideAsInactive();
            });
        });
    }

    /** Removes the document-level `Escape` listener. */
    private stopListeningForEscape(): void {
        this.unbindEscapeListener?.();
        this.unbindEscapeListener = null;
    }

    /** Panel classes of the tooltip overlay, including the pointer-events opt-out while it is enabled. */
    private getPanelClasses(): string[] {
        const configured = this.overlayConfig.panelClass;
        const classes = (Array.isArray(configured) ? configured : configured ? [configured] : []).filter(
            (name) => name !== IGNORE_POINTER_EVENTS_PANEL_CLASS
        );

        // A tooltip without an interactive trigger opts out regardless of the input: hovering its pane
        // neither keeps it open nor closes it, so the hoverability the default protects does not exist here,
        // and a pointer-capturing pane only blocks what it floats over. The validation hints of datepicker,
        // timepicker and inline-edit sit above their own field for `validationTooltipHideDelay` (3s).
        const ignorePointerEvents = this.ignoreTooltipPointerEvents() || !this.hasInteractiveTrigger;

        return ignorePointerEvents ? [...classes, IGNORE_POINTER_EVENTS_PANEL_CLASS] : classes;
    }

    /**
     * Points the trigger's `aria-describedby` at the open tooltip, so assistive technology announces the hint
     * together with the control it explains.
     *
     * Written through the renderer rather than a host binding because `showForMouseEvent` re-anchors the
     * trigger to a foreign element, which a host binding would never reach. Existing ids are preserved.
     */
    private describeTrigger(): void {
        if (this.describesHostText) return;

        const nativeElement = this.getNativeElement();
        const ids = this.getDescribedByIds(nativeElement);

        // Recorded rather than resolved again on the way out: `showForMouseEvent` re-anchors the trigger to
        // another element, and un-describing the current one would leave the id dangling on the previous.
        this.describedElement = nativeElement;

        if (ids.includes(this.tooltipId)) return;

        this.renderer.setAttribute(nativeElement, 'aria-describedby', [...ids, this.tooltipId].join(' '));
    }

    /** Removes this tooltip's id from the described element's `aria-describedby`, keeping any other ids. */
    private undescribeTrigger(): void {
        const nativeElement = this.describedElement;

        if (!nativeElement) return;

        this.describedElement = null;

        const ids = this.getDescribedByIds(nativeElement).filter((id) => id !== this.tooltipId);

        if (ids.length) {
            this.renderer.setAttribute(nativeElement, 'aria-describedby', ids.join(' '));
        } else {
            this.renderer.removeAttribute(nativeElement, 'aria-describedby');
        }
    }

    /** Element whose `aria-describedby` points at this tooltip, or `null` while nothing is described. */
    private describedElement: HTMLElement | null = null;

    /** Ids currently listed in the element's `aria-describedby`. */
    private getDescribedByIds(element: HTMLElement): string[] {
        return (element.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    }

    /**
     * Whether the tooltip only repeats the text the host already shows — which is what `kbq-title` does.
     * Describing those would make assistive technology read the same label twice.
     */
    private get describesHostText(): boolean {
        return typeof this.content === 'string' && this.content.trim() === this.getNativeElement().textContent?.trim();
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

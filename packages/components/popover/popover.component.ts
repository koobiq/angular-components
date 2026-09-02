import { AnimationEvent } from '@angular/animations';
import {
    CdkTrapFocus,
    ConfigurableFocusTrapFactory,
    FOCUS_TRAP_INERT_STRATEGY,
    FocusMonitor,
    FocusTrapFactory
} from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { CdkObserveContent } from '@angular/cdk/observers';
import {
    CdkScrollable,
    FlexibleConnectedPositionStrategy,
    OverlayConfig,
    ScrollDispatcher,
    ScrollStrategy
} from '@angular/cdk/overlay';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
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
    OnInit,
    Output,
    Provider,
    TemplateRef,
    Type,
    ViewChild,
    ViewEncapsulation,
    booleanAttribute,
    computed,
    inject,
    input,
    numberAttribute,
    viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    EmptyFocusTrapStrategy,
    KBQ_WINDOW,
    KbqComponentColors,
    KbqOverflowShadowBottom,
    KbqOverflowShadowContainer,
    KbqOverflowShadowTop,
    KbqPopUp,
    KbqPopUpPlacementValues,
    KbqPopUpSizeValues,
    KbqPopUpTrigger,
    KbqStickToWindowPlacementValues,
    POSITION_TO_CSS_MAP,
    PopUpSizes,
    PopUpTriggers,
    PopUpVisibility,
    applyPopupMargins,
    kbqInjectA11yLocaleConfiguration,
    kbqRepositionScrollStrategyFactory,
    kbqSiblingPopupProvider
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { NEVER, merge } from 'rxjs';
import { kbqPopoverAnimations } from './popover-animations';

export const defaultOffsetYWithArrow = 8;

/** Leave delay applied to a hover-triggered popover when `kbqLeaveDelay` is not bound. */
export const defaultHoverLeaveDelay = 500;

/** Debounce of the content-mutation observer that drives the scroll shadows, in milliseconds. */
const contentObserverDebounce = 15;

/** DOM event names the shared pop-up base records right before opening on a pointer or focus event. */
const passiveOpenEvents = ['mouseenter', 'focus'];

let nextUniqueId = 0;

/**
 * Focus-trap wiring of a popover panel.
 *
 * Provided on the panel components rather than on `KbqPopoverModule`: both entries are injector-wide, so at
 * module level they replaced the CDK inert strategy for every other focus trap in the importing injector.
 *
 * @docs-private
 */
export const KBQ_POPOVER_FOCUS_TRAP_PROVIDERS: Provider[] = [
    { provide: FocusTrapFactory, useClass: ConfigurableFocusTrapFactory },
    { provide: FOCUS_TRAP_INERT_STRATEGY, useClass: EmptyFocusTrapStrategy }
];

@Component({
    selector: 'kbq-popover-component',
    imports: [
        NgTemplateOutlet,
        CdkObserveContent,
        KbqButtonModule,
        KbqIconModule,
        KbqScrollbarViewport,
        CdkTrapFocus,
        KbqOverflowShadowContainer,
        KbqOverflowShadowTop,
        KbqOverflowShadowBottom
    ],
    templateUrl: './popover.component.html',
    styleUrls: ['./popover.scss', './popover-tokens.scss'],
    providers: KBQ_POPOVER_FOCUS_TRAP_PROVIDERS,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '(keydown.esc)': 'onEscape()',
        '[@.disabled]': 'reducedMotion'
    },
    animations: [kbqPopoverAnimations.popoverState],
    preserveWhitespaces: false
})
export class KbqPopoverComponent extends KbqPopUp implements AfterViewInit {
    /** Accessible name for the icon-only close button. */
    protected readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();

    /** Whether the opening/closing animation must be skipped because the user asked for reduced motion. */
    protected readonly reducedMotion: boolean =
        inject(KBQ_WINDOW).matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    /** Debounce shared by the mutation observer and the scroll-shadow container (both expose `debounce`). */
    protected readonly contentObserverDebounce = contentObserverDebounce;

    prefix = 'kbq-popover';

    header: string | TemplateRef<any>;
    footer: string | TemplateRef<any>;

    trigger: KbqPopoverTrigger;

    isTrapFocus: boolean = false;
    hasCloseButton: boolean = false;

    /** Id of the panel element, referenced by the trigger's `aria-controls`. Written by the trigger. */
    panelId: string;

    /** Accessible name of the panel, used when there is no header to label it. Written by the trigger. */
    ariaLabel: string | undefined;

    /**
     * Panel element (`.kbq-popover`), not the component host.
     *
     * Deliberately shadows the injected `KbqPopUp.elementRef`: the base measures and decorates the visible
     * panel, so both `applyPopupMargins` here and `setStickPosition`/`addEventListenerForHide` in the base
     * must resolve to the same element. The confirm template carries the matching `#popover` reference.
     */
    @ViewChild('popover') elementRef: ElementRef;
    readonly cdkTrapFocus = viewChild.required(CdkTrapFocus);
    /** @docs-private */
    readonly overflowContainer = viewChild(KbqOverflowShadowContainer);

    private readonly scrollbarViewport = viewChild(KbqScrollbarViewport);

    /** Id of the header text node, referenced by the panel's `aria-labelledby`. */
    get headerId(): string {
        return `${this.panelId}-header`;
    }

    /**
     * Whether the header can name the dialog. Only a string header renders a text node with an id to point
     * `aria-labelledby` at; a template header is arbitrary markup, so those panels fall back to `ariaLabel`.
     */
    protected get labelledByHeader(): boolean {
        return !!this.header && !this.isTemplateRef(this.header);
    }

    ngAfterViewInit() {
        this.visibleChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((state) => {
            if (this.offset !== null && state && this.elementRef) {
                applyPopupMargins(
                    this.renderer,
                    this.elementRef.nativeElement,
                    this.prefix,
                    `${this.offset!.toString()}px`
                );

                this.setStickPosition();
            }

            // Every closing path ends here, and the panel is still in the DOM at this point, so this is the
            // one place where focus can be handed back to the trigger instead of falling to `<body>`.
            if (!state) {
                this.trigger?.restoreFocus();
            }
        });

        // A hover- or focus-triggered popover is dismissed by the pointer leaving it, so capturing the
        // keyboard would strand focus on `<body>` when it auto-hides.
        if (this.trigger?.capturesFocusOnOpen ?? true) {
            this.cdkTrapFocus().focusTrap.focusFirstTabbableElement();
        }
    }

    updateClassMap(placement: string, customClass: string, size: KbqPopUpSizeValues) {
        super.updateClassMap(placement, customClass, { [`${this.prefix}_${size}`]: !!size });
    }

    updateTrapFocus(isTrapFocus: boolean): void {
        this.isTrapFocus = isTrapFocus;
    }

    onEscape() {
        this.requestClose();
    }

    /** Handles a click on the close button. */
    protected onClose(): void {
        this.requestClose();
    }

    /**
     * Closes the panel through its trigger, so that `kbqPopoverPreventClose` is honored and focus is restored
     * the same way as on every other closing path.
     *
     * The component is exported and can be rendered without a trigger — `ngAfterViewInit` already allows for
     * that — and such a panel has no `preventClose` to honor and no trigger to hand focus back to, so it hides
     * itself rather than throwing on a keypress.
     */
    private requestClose(): void {
        if (this.trigger) {
            this.trigger.close();
        } else {
            this.hide(0);
        }
    }

    /**
     * Whether the scrollable content region needs its own tab stop and landmark (AXE
     * `scrollable-region-focusable`). An unconditional `tabindex` would add a stop to every popover.
     */
    protected isScrollableRegion(container: KbqOverflowShadowContainer): boolean {
        const { top, bottom } = container.overflow();

        return top || bottom;
    }

    override animationDone(event: AnimationEvent): void {
        super.animationDone(event);

        if (event.toState === PopUpVisibility.Visible) {
            this.scrollbarViewport()?.flashScrollIndicators();
        }
    }

    protected readonly componentColors = KbqComponentColors;
}

export const KBQ_POPOVER_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>('kbq-popover-scroll-strategy', {
    providedIn: 'root',
    factory: () => kbqPopoverScrollStrategyFactory(inject(ScrollDispatcher))
});

/** @docs-private */
export function kbqPopoverScrollStrategyFactory(scrollDispatcher: ScrollDispatcher): () => ScrollStrategy {
    return kbqRepositionScrollStrategyFactory(scrollDispatcher, { scrollThrottle: 20 });
}

/** @docs-private */
export const KBQ_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: KBQ_POPOVER_SCROLL_STRATEGY,
    deps: [ScrollDispatcher],
    useFactory: kbqPopoverScrollStrategyFactory
};

/**
 * Creates an error to be thrown if the user supplied an invalid popover position.
 *
 * @deprecated An invalid placement is not fatal: it is reported with a warning and falls back to `top`.
 * Will be removed in the next major release.
 */
export function getKbqPopoverInvalidPositionError(position: string) {
    return Error(`KbqPopover position "${position}" is invalid.`);
}

@Directive({
    selector: '[kbqPopover]',
    providers: [kbqSiblingPopupProvider(KbqPopoverTrigger)],
    host: {
        '[class.kbq-popover_open]': 'isOpen',
        '[class.kbq-active]': 'hasClickTrigger && isOpen',
        '[attr.aria-expanded]': 'hasClickTrigger ? isOpen : null',
        '[attr.aria-haspopup]': 'hasClickTrigger ? "dialog" : null',
        '[attr.aria-controls]': 'hasClickTrigger && isOpen ? panelId : null',
        '(keydown)': 'keydownHandler($event)',
        '(touchend)': 'touchendHandler()'
    },
    exportAs: 'kbqPopover'
})
export class KbqPopoverTrigger extends KbqPopUpTrigger<KbqPopoverComponent> implements AfterContentInit, OnInit {
    protected scrollStrategy: () => ScrollStrategy = inject(KBQ_POPOVER_SCROLL_STRATEGY);

    private readonly focusMonitor = inject(FocusMonitor);
    private readonly document = inject(DOCUMENT);

    /** Id of the panel this trigger controls, shared with `aria-controls`. */
    readonly panelId: string = `kbq-popover-${nextUniqueId++}`;

    /**
     * Controls whether the component should be hidden when it is not visible in the viewport.
     *
     * @deprecated Use `kbqPopoverHideIfNotInViewPort`. The unprefixed alias will be removed in the next
     * major release.
     */
    readonly hideIfNotInViewPort = input(true, { transform: booleanAttribute });

    /**
     * Input (`kbqPopoverHideIfNotInViewPort`) — prefixed alias of {@link hideIfNotInViewPort}. Left
     * `undefined` when it is not bound, so the deprecated alias keeps winning until it is removed.
     */
    readonly popoverHideIfNotInViewPort = input<boolean | undefined, unknown>(undefined, {
        alias: 'kbqPopoverHideIfNotInViewPort',
        transform: (value: unknown) => (value == null ? undefined : booleanAttribute(value))
    });

    /** prevents closure by any event */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ alias: 'kbqPopoverPreventClose', transform: booleanAttribute }) override preventClose: boolean = false;

    /**
     * disables default padding for all popover elements (header, content and footer)
     *
     * @deprecated Use `kbqPopoverDefaultPaddings`. The unprefixed alias will be removed in the next major
     * release.
     */
    // TODO: Skipped for migration because:
    //  Class of this input is referenced in the signature of another class.
    @Input({ transform: booleanAttribute }) defaultPaddings = true;

    /** Input (`kbqPopoverDefaultPaddings`) — prefixed alias of {@link defaultPaddings}. */
    @Input({ alias: 'kbqPopoverDefaultPaddings', transform: booleanAttribute })
    set popoverDefaultPaddings(value: boolean) {
        this.defaultPaddings = value;
    }

    /** Input (`kbqPopoverVisible`) — opens the popover when set to `true` and closes it when set to `false`. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPopoverVisible')
    get popoverVisible(): boolean {
        return this.visible;
    }

    set popoverVisible(value: boolean) {
        super.updateVisible(value);
    }

    /** Input (`kbqPopoverPlacement`) — preferred placement of the panel relative to the trigger. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPopoverPlacement')
    get popoverPlacement(): KbqPopUpPlacementValues {
        return this.placement;
    }

    set popoverPlacement(value: KbqPopUpPlacementValues) {
        super.updatePlacement(value);
    }

    /** Input (`kbqPopoverPlacementPriority`) — ordered placements tried before the default strategy. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
    // TODO: Skipped for migration because:
    //  This input overrides a field from a superclass, while the superclass field
    //  is not migrated.
    @Input('kbqPopoverStickToWindow') stickToWindow: KbqStickToWindowPlacementValues;

    /**
     * Container for additional positioning, used with kbqPopoverStickToWindow
     *
     * @deprecated Use `kbqPopoverContainer`. The unprefixed alias will be removed in the next major release.
     */
    // TODO: Skipped for migration because:
    //  This input overrides a field from a superclass, while the superclass field
    //  is not migrated.
    @Input() container: HTMLElement;

    /** Input (`kbqPopoverContainer`) — prefixed alias of {@link container}. */
    @Input('kbqPopoverContainer')
    set popoverContainer(value: HTMLElement) {
        this.container = value;
    }

    /**
     * Input (`hasBackdrop`) — whether a backdrop is rendered behind the panel. With a backdrop the popover
     * closes on a backdrop click instead of on any outside pointer event.
     *
     * @deprecated Use `kbqPopoverHasBackdrop`. The unprefixed alias will be removed in the next major release.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get hasBackdrop(): boolean {
        return this._hasBackdrop;
    }

    set hasBackdrop(value: boolean) {
        this._hasBackdrop = coerceBooleanProperty(value);

        this.invalidateOverlay();
    }

    private _hasBackdrop: boolean = false;

    /** Input (`kbqPopoverHasBackdrop`) — prefixed alias of {@link hasBackdrop}. */
    @Input('kbqPopoverHasBackdrop')
    set popoverHasBackdrop(value: boolean) {
        this.hasBackdrop = value;
    }

    /** Input (`kbqPopoverHeader`) — header of the panel, as a string or a template. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPopoverHeader')
    get header(): string | TemplateRef<any> {
        return this._header;
    }

    set header(value: string | TemplateRef<any>) {
        this._header = value;

        this.updateData();
    }

    private _header: string | TemplateRef<any>;

    /** Input (`kbqPopoverContent`) — content of the panel, as a string or a template. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPopoverContent')
    get content(): string | TemplateRef<any> {
        return this._content;
    }

    set content(value: string | TemplateRef<any>) {
        this._content = value;

        this.updateData();
    }

    /** Input (`kbqPopoverFooter`) — footer of the panel, as a string or a template. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPopoverFooter')
    get footer(): string | TemplateRef<any> {
        return this._footer;
    }

    set footer(value: string | TemplateRef<any>) {
        this._footer = value;

        this.updateData();
    }

    private _footer: string | TemplateRef<any>;

    /** Input (`kbqPopoverDisabled`) — disables the trigger and closes an open popover. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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

    /**
     * Input (`kbqTrigger`) with the comma-separated trigger events. An empty value resets to click + keydown
     * and rebinds listeners. The alias is shared with `kbqTooltip`, so binding it on an element that carries
     * both reconfigures both.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqTrigger')
    get trigger(): string {
        return this._trigger;
    }

    set trigger(value: string) {
        if (value) {
            this._trigger = value;

            if (this.trigger.includes(PopUpTriggers.Hover)) {
                this.hideWithTimeout = true;
            }
        } else {
            this._trigger = `${PopUpTriggers.Click}, ${PopUpTriggers.Keydown}`;
        }

        // Re-derived from the trigger on every change rather than applied once to an unset delay: a popover
        // switched to `hover` later closes on the 0 it was born with otherwise, leaving no time to cross the
        // gap between the trigger and the panel.
        if (!this.leaveDelayBound) {
            this.leaveDelay = this._trigger.includes(PopUpTriggers.Hover) ? defaultHoverLeaveDelay : 0;
        }

        this.initListeners();
    }

    private _trigger: string = `${PopUpTriggers.Click}, ${PopUpTriggers.Keydown}`;

    /** Input (`kbqPopoverSize`) — preset width of the panel. An unknown value falls back to `medium`. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPopoverSize')
    get size(): KbqPopUpSizeValues {
        return this._size;
    }

    set size(value: KbqPopUpSizeValues) {
        if ([PopUpSizes.Small, PopUpSizes.Medium, PopUpSizes.Large, PopUpSizes.Custom].includes(value as PopUpSizes)) {
            this._size = value;

            this.updateClassMap();
        } else {
            this._size = PopUpSizes.Medium;

            // eslint-disable-next-line no-console
            console.warn(`Unknown size: ${value}. Will use the default size: ${this._size}`);
        }
    }

    private _size: KbqPopUpSizeValues = PopUpSizes.Medium;

    /** Input (`kbqPopoverClass`) with extra CSS classes applied to the panel. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPopoverClass')
    get customClass() {
        return this._customClass;
    }

    set customClass(value: string) {
        this._customClass = value;

        this.updateClassMap();
    }

    /** Context for popover templates (kbqPopoverHeader, kbqPopoverContent and kbqPopoverFooter). */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPopoverContext')
    get context() {
        return this._context;
    }

    set context(ctx) {
        this._context = ctx;
        this.updateData();
    }

    private _context: unknown = null;

    /**
     * Accessible name of the panel. Ignored while a string `kbqPopoverHeader` is set — the header labels the
     * dialog then — and recommended for every header-less popover.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPopoverAriaLabel')
    get ariaLabel(): string | undefined {
        return this._ariaLabel;
    }

    set ariaLabel(value: string | undefined) {
        this._ariaLabel = value;

        this.updateData();
    }

    private _ariaLabel: string | undefined;

    /**
     * Input (`hasCloseButton`) — renders the icon-only close button in the top corner of the panel.
     *
     * @deprecated Use `kbqPopoverHasCloseButton`. The unprefixed alias will be removed in the next major
     * release.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get hasCloseButton(): boolean {
        return this._hasCloseButton;
    }

    set hasCloseButton(value: boolean) {
        this._hasCloseButton = value;
        this.updateData();
    }

    private _hasCloseButton = false;

    /** Input (`kbqPopoverHasCloseButton`) — prefixed alias of {@link hasCloseButton}. */
    @Input({ alias: 'kbqPopoverHasCloseButton', transform: booleanAttribute })
    set popoverHasCloseButton(value: boolean) {
        this.hasCloseButton = value;
    }

    /**
     * Controls the behavior of closing the component on scroll. Three states:
     * - `null` (default) — the popover survives a scroll, except when it scrolls out of a
     *   `.kbq-hide-nested-popup` container, which closes it;
     * - `true` — any scroll closes the popover;
     * - `false` — no scroll closes the popover, not even a `.kbq-hide-nested-popup` one.
     *
     * Use CloseScrollStrategy as alternative
     *
     * @deprecated Use `kbqPopoverCloseOnScroll`. The unprefixed alias will be removed in the next major
     * release.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get closeOnScroll(): boolean | null {
        return this._closeOnScroll;
    }

    set closeOnScroll(value: boolean) {
        this._closeOnScroll = coerceBooleanProperty(value);
    }

    private _closeOnScroll: boolean | null = null;

    /** Input (`kbqPopoverCloseOnScroll`) — prefixed alias of {@link closeOnScroll}. */
    @Input('kbqPopoverCloseOnScroll')
    set popoverCloseOnScroll(value: boolean) {
        this.closeOnScroll = value;
    }

    /** Whether the trigger opens the popover on click, which is also what makes it a labelled dialog opener. */
    get hasClickTrigger(): boolean {
        return this.trigger.includes(PopUpTriggers.Click);
    }

    /**
     * Whether opening the popover should move the keyboard focus into the panel. Only deliberate opens
     * (click, keyboard, programmatic) do — a hover- or focus-triggered popover must not steal focus.
     */
    get capturesFocusOnOpen(): boolean {
        return this.hasClickTrigger || this.deliberateOpen;
    }

    /** @docs-private */
    get instanceDestroyRef(): DestroyRef {
        return this.instance.destroyRef;
    }

    /**
     * Input (`backdropClass`) — CSS class applied to the backdrop, when there is one.
     *
     * @deprecated Use `kbqPopoverBackdropClass`. The unprefixed alias will be removed in the next major
     * release.
     */
    // TODO: Skipped for migration because:
    //  Class of this input is referenced in the signature of another class.
    @Input()
    get backdropClass(): string {
        return this._backdropClass;
    }

    set backdropClass(value: string) {
        this._backdropClass = value;

        this.invalidateOverlay();
    }

    private _backdropClass: string = 'cdk-overlay-transparent-backdrop';

    /** Input (`kbqPopoverBackdropClass`) — prefixed alias of {@link backdropClass}. */
    @Input('kbqPopoverBackdropClass')
    set popoverBackdropClass(value: string) {
        this.backdropClass = value;
    }

    /** Input (`kbqPopoverArrow`) — renders the arrow pointing at the trigger. */
    // TODO: Skipped for migration because:
    //  This input overrides a field from a superclass, while the superclass field
    //  is not migrated.
    @Input({ alias: 'kbqPopoverArrow', transform: booleanAttribute }) arrow: boolean = true;

    /** Input (`kbqPopoverOffset`) — distance between the trigger and the panel, in pixels. */
    // TODO: Skipped for migration because:
    //  Class of this input is referenced in the signature of another class.
    @Input({ alias: 'kbqPopoverOffset', transform: numberAttribute }) offset: number | null = defaultOffsetYWithArrow;

    /** Input (`kbqEnterDelay`) — delay before opening, in milliseconds. Defaults to `0`. */
    // TODO: Skipped for migration because:
    //  This input overrides a field from a superclass, while the superclass field
    //  is not migrated.
    @Input({ alias: 'kbqEnterDelay', transform: numberAttribute }) enterDelay: number = 0;

    /**
     * Input (`kbqLeaveDelay`) — delay before closing, in milliseconds. Defaults to `0`, and to
     * {@link defaultHoverLeaveDelay} when `kbqTrigger` includes `hover`.
     */
    // A write-only input rather than an accessor over `leaveDelay`: the base declares that member as a
    // plain field, and TypeScript refuses to override a property with an accessor (TS2611).
    @Input({ transform: numberAttribute })
    set kbqLeaveDelay(value: number) {
        this.leaveDelay = value;
        // Tracked instead of comparing the delay against a sentinel: an explicit `kbqLeaveDelay="0"` and an
        // unbound one are indistinguishable by value, and only the latter takes the hover default.
        this.leaveDelayBound = true;
    }

    private leaveDelayBound = false;

    /**
     * Emits the resolved placement whenever the panel is repositioned.
     *
     * Declared as `string` to match the abstract member on `KbqPopUpTrigger`: `EventEmitter` is invariant,
     * so a narrower emitter cannot override a wider one. Narrowing both is a change to the shared pop-up
     * base and belongs to the branch that owns it.
     */
    @Output('kbqPopoverPlacementChange') readonly placementChange = new EventEmitter<string>();

    /** Emits `true` when the panel opens and `false` when it closes. */
    @Output('kbqPopoverVisibleChange') readonly visibleChange = new EventEmitter<boolean>();

    protected originSelector = '.kbq-popover';

    /** Resolved value of the two `hideIfNotInViewPort` aliases. */
    private readonly shouldHideIfNotInViewPort = computed(
        () => this.popoverHideIfNotInViewPort() ?? this.hideIfNotInViewPort()
    );

    /** Whether a position re-apply is already queued for this turn. */
    private repositionScheduled = false;

    /**
     * Whether the open currently on screen was a deliberate one rather than a pointer or focus one.
     *
     * The shared base records the event that opened the pop-up in `triggerName`, but its keyboard opener is
     * the one listener registered without that bookkeeping, and it defers the open to a task of its own —
     * by then `triggerName` still holds whatever the pointer last did. Frozen on every `show()`, which the
     * pointer and focus listeners reach with the name they have just written.
     */
    private deliberateOpen = true;

    // NB: the trigger↔popover gap is a CSS `margin` on `.kbq-popover` (see `applyPopupMargins`), which sits inside
    // this `pointer-events: auto` pane, so the gap band is already covered and not click/hover-through. This is why
    // the connected-overlay `offsetY`→in-pane-padding fix (KBQ_CONNECTED_OVERLAY_* / --kbq-connected-overlay-gap,
    // used by select/tree-select/autocomplete/datepicker) intentionally does NOT apply here — do not "port" it.
    // Guarded by the "trigger↔panel gap is not click-through" e2e tests in e2e.playwright-spec.ts.
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
            .subscribe(this.hideIfScrolledOutOfView);
    }

    ngAfterContentInit(): void {
        if (this.closeOnScroll === null) {
            this.scrollDispatcher
                .scrolled()
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(this.hideIfNestedPopupScrolledAway);
        }
    }

    /** @docs-private */
    show(delay: number = this.enterDelay): void {
        this.deliberateOpen = !passiveOpenEvents.includes(this.triggerName);

        super.show(delay);
    }

    /** @docs-private */
    updateData() {
        if (!this.instance) return;

        this.instance.header = this.header;
        this.instance.content = this.content;
        this.instance.context = this.context != null ? { $implicit: this.context } : null;
        // `setStickPosition` drops the arrow because a stuck panel no longer points at its trigger; copying
        // the input back would resurrect a detached rotated square on the next update.
        this.instance.arrow = this.stickToWindow ? false : this.arrow;
        this.instance.offset = this.offset;
        this.instance.footer = this.footer;
        this.instance.hasCloseButton = this.hasCloseButton;
        this.instance.defaultPaddings = this.defaultPaddings;
        this.instance.panelId = this.panelId;
        this.instance.ariaLabel = this.ariaLabel;

        this.instance.updateTrapFocus(this.trigger !== PopUpTriggers.Focus);

        if (this.isOpen) {
            this.scheduleReposition();
        }
    }

    /**
     * Re-applies the overlay position.
     *
     * Deliberately narrower than the inherited one, which also rebuilds the closing-action subscription:
     * that stream carries a `delay(0)`, so a reposition coalesced into the same task as an outside click —
     * which is the task in which that click's change detection writes a popover input — would drop the
     * close the click had already scheduled.
     */
    updatePosition(reapplyPosition: boolean = false) {
        this.overlayRef = this.createOverlay();

        const position = (this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy)
            .withPositions(this.getAdjustedPositions())
            .withPush(true);

        if (reapplyPosition) {
            setTimeout(() => position.reapplyLastPosition());
        }
    }

    /** @docs-private */
    getOverlayHandleComponentType(): Type<KbqPopoverComponent> {
        return KbqPopoverComponent;
    }

    /** @docs-private */
    updateClassMap(newPlacement: string = this.placement) {
        if (!this.instance) {
            return;
        }

        this.instance.updateClassMap(POSITION_TO_CSS_MAP[newPlacement], this.customClass, this.size);
        this.instance.markForCheck();
    }

    /** @docs-private */
    closingActionsForClick() {
        if (this.hasClickTrigger) {
            return this.defaultClosingActions();
        }

        return [];
    }

    /** @docs-private */
    defaultClosingActions() {
        return [
            this.overlayRef!.backdropClick(),
            this.hasBackdrop ? NEVER : this.overlayRef!.outsidePointerEvents()
        ];
    }

    /** @docs-private */
    closingActions() {
        // Inner panel scrolling must not trigger closeOnScroll.
        const scrolled = this.closeOnScroll ? this.scrollDispatcher.ancestorScrolled(this.getNativeElement()) : NEVER;

        return merge(...this.closingActionsForClick(), scrolled);
    }

    /**
     * Returns focus to the trigger when the popover is closed while focus is still inside its panel.
     *
     * Goes through `FocusMonitor` rather than a native `focus()` call: the kbq focus ring is only rendered
     * for a monitored origin, and a `program` origin keeps a tooltip on the same element from re-opening.
     */
    restoreFocus(): void {
        if (!this.overlayRef?.overlayElement?.contains(this.document.activeElement)) return;

        this.focusMonitor.focusVia(this.getNativeElement(), 'program');
    }

    /**
     * Closes the popover on a deliberate action — the panel's close button, or `Escape` inside the panel.
     *
     * `hide()` keeps a hover popover open while the pointer rests on the panel, so that the pointer can
     * travel from the trigger to the content; that is exactly where the pointer is when the close button is
     * clicked, so a deliberate close answers to `kbqPopoverPreventClose` and to nothing else.
     */
    close(): void {
        if (this.preventClose) return;

        this.instance?.hide(0);
    }

    /**
     * Coalesces the position re-apply: a burst of input writes — or a parent change-detection pass that
     * recreates the object bound to `kbqPopoverContext` — schedules one reposition per turn instead of one
     * per write, each of which costs a forced layout read per candidate position.
     */
    private scheduleReposition(): void {
        if (this.repositionScheduled) return;

        this.repositionScheduled = true;

        queueMicrotask(() => {
            this.repositionScheduled = false;

            if (this.isOpen && this.overlayRef?.hasAttached()) {
                this.updatePosition(true);
            }
        });
    }

    /**
     * Drops a closed overlay so the next `show()` rebuilds it. The backdrop and its class are baked into the
     * overlay when it is created, and CDK does not re-render them from the config afterwards.
     */
    private invalidateOverlay(): void {
        if (!this.overlayRef || this.overlayRef.hasAttached()) return;

        this.overlayRef.dispose();
        this.overlayRef = null;
    }

    /** Closes the popover once it has scrolled out of its nearest scrollable ancestor. */
    private hideIfScrolledOutOfView = () => {
        if (!this.instance || !this.scrollable || !this.shouldHideIfNotInViewPort()) return;

        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        const containerRect = this.scrollable.getElementRef().nativeElement.getBoundingClientRect();

        const intersectsContainer =
            rect.bottom >= containerRect.top &&
            rect.right >= containerRect.left &&
            rect.top <= containerRect.bottom &&
            rect.left <= containerRect.right;

        if (!intersectsContainer) {
            this.hide();
        }
    };

    /** Closes the popover once its trigger has scrolled out of a `.kbq-hide-nested-popup` container. */
    private hideIfNestedPopupScrolledAway = (scrollable: CdkScrollable | void) => {
        if (!this.instance) return;

        if (!scrollable?.getElementRef().nativeElement.classList.contains('kbq-hide-nested-popup')) return;

        const parentRects = scrollable.getElementRef().nativeElement.getBoundingClientRect();
        const childRects = this.elementRef.nativeElement.getBoundingClientRect();

        if (childRects.bottom < parentRects.top || childRects.top > parentRects.bottom) {
            this.hide();
        }
    };
}

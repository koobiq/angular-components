import {
    CdkTrapFocus,
    ConfigurableFocusTrapFactory,
    FOCUS_TRAP_INERT_STRATEGY,
    FocusTrapFactory,
    _IdGenerator
} from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FlexibleConnectedPositionStrategy, Overlay, OverlayConfig, ScrollStrategy } from '@angular/cdk/overlay';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { AsyncPipe } from '@angular/common';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Directive,
    EventEmitter,
    InjectionToken,
    Injector,
    Input,
    NgZone,
    Output,
    RendererStyleFlags2,
    TemplateRef,
    Type,
    ViewEncapsulation,
    afterNextRender,
    booleanAttribute,
    forwardRef,
    inject,
    input,
    numberAttribute,
    viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButton, KbqButtonModule } from '@koobiq/components/button';
import {
    DateAdapter,
    EmptyFocusTrapStrategy,
    KbqNotificationCenterLocaleConfiguration,
    KbqOverflowShadowBottom,
    KbqOverflowShadowContainer,
    KbqOverflowShadowTop,
    KbqPopUp,
    KbqPopUpPlacementValues,
    KbqPopUpSizeValues,
    KbqPopUpTrigger,
    KbqStickToWindowPlacementValues,
    POSITION_TO_CSS_MAP,
    PopUpPlacements,
    PopUpSizes,
    PopUpTriggers,
    applyPopupMargins,
    kbqInjectA11yLocaleConfiguration,
    kbqInjectLocaleConfiguration
} from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { BehaviorSubject, Subject, merge } from 'rxjs';
import { auditTime, distinctUntilChanged, filter, map, pairwise } from 'rxjs/operators';
import { KbqNotificationCenterService, KbqNotificationsGroup } from './notification-center.service';
import {
    KBQ_NOTIFICATION_CENTER_CONFIGURATION,
    KBQ_NOTIFICATION_CENTER_PANEL,
    KbqNotificationCenterPanel
} from './notification-center.tokens';
import { KbqNotificationItemComponent } from './notification-item';

const defaultOffsetX = 8;

/** Rate-limit window (ms) for the scroll-to-bottom check that drives infinite scroll. */
const SCROLLED_TO_BOTTOM_AUDIT_TIME = 100;

/**
 * Tolerance (px) applied when checking whether the list has reached its bottom.
 *
 * `scrollHeight` and `clientHeight` are CSSOM `long`s (rounded to the nearest integer) while
 * `scrollTop` is an `unrestricted double`. At fractional browser zoom or a fractional
 * `devicePixelRatio` the layout lands on fractional CSS pixels and the two roundings go
 * independently, so at the true bottom `scrollHeight - scrollTop - clientHeight` lands anywhere in
 * (-1, 1) rather than on 0 — an exact `<= 0` check then succeeds only about half the time. Below
 * 100% zoom one device pixel is wider than one CSS pixel, which scales the residual by ~1/zoom and
 * pushes it past 1. 2px covers zoom down to 50% and is imperceptible as a trigger threshold.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
 */
const SCROLLED_TO_BOTTOM_TOLERANCE = 2;

/** Custom property the panel height is published through, so the stylesheet stays the single owner. */
const POPOVER_HEIGHT_PROPERTY = '--kbq-notification-center-popover-height';

/** Delete buttons of the day groups and of the individual notifications. */
const REMOVE_BUTTON_SELECTOR = '.kbq-notification-center-sub-header__button, .kbq-notification-item__remove-button';

/** @docs-private */
export const KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
    'kbq-notification-center-scroll-strategy',
    {
        providedIn: 'root',
        factory: () => kbqNotificationCenterScrollStrategyFactory(inject(Overlay))
    }
);

/** @docs-private */
export function kbqNotificationCenterScrollStrategyFactory(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition({ scrollThrottle: 20 });
}

/** @docs-private */
@Component({
    selector: 'kbq-notification-center',
    imports: [
        KbqIconModule,
        KbqBadgeModule,
        KbqScrollbarViewport,
        KbqButtonModule,
        KbqDividerModule,
        KbqDropdownModule,
        KbqToolTipModule,
        AsyncPipe,
        CdkTrapFocus,
        KbqNotificationItemComponent,
        KbqLoaderOverlayModule,
        KbqProgressSpinnerModule,
        KbqOverflowShadowContainer,
        KbqOverflowShadowTop,
        KbqOverflowShadowBottom
    ],
    templateUrl: './notification-center.html',
    styleUrls: ['./notification-center.scss', './notification-center-tokens.scss'],
    providers: [
        // The panel traps focus, so it needs a configurable trap even when it is imported standalone —
        // these used to be reachable only through KbqNotificationCenterModule.
        { provide: FocusTrapFactory, useClass: ConfigurableFocusTrapFactory },
        { provide: FOCUS_TRAP_INERT_STRATEGY, useClass: EmptyFocusTrapStrategy },
        { provide: KBQ_NOTIFICATION_CENTER_PANEL, useExisting: forwardRef(() => KbqNotificationCenterComponent) }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-notification-center',
        role: 'dialog',
        '[attr.id]': 'panelId',
        '[attr.aria-labelledby]': 'titleId',
        '[class.kbq-notification-center_popover]': 'popoverMode',
        '(keydown.escape)': 'escapeHandler()'
    },
    preserveWhitespaces: false
})
export class KbqNotificationCenterComponent extends KbqPopUp implements AfterViewInit, KbqNotificationCenterPanel {
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    /** @docs-private */
    protected readonly dateAdapter = inject(DateAdapter);
    /** @docs-private */
    protected readonly service = inject(KbqNotificationCenterService);

    private readonly injector = inject(Injector);
    private readonly ngZone = inject(NgZone);
    private readonly idGenerator = inject(_IdGenerator);

    /** Accessible names for the icon-only toolbar buttons.
     * @docs-private */
    protected readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();

    /**
     * Localized strings of the notification center.
     *
     * Read through a signal so that a runtime `setLocale()` reaches `KbqNotificationItemComponent`, which
     * renders these strings from its own `OnPush` view: a `markForCheck()` here would mark this component
     * only, never the already-rendered items.
     */
    get configuration(): KbqNotificationCenterLocaleConfiguration {
        return this._configuration();
    }

    private readonly _configuration = kbqInjectLocaleConfiguration(
        'notificationCenter',
        KBQ_NOTIFICATION_CENTER_CONFIGURATION
    );

    /** Id of the panel heading, referenced by the host's `aria-labelledby`.
     * @docs-private */
    protected readonly titleId = this.idGenerator.getId('kbq-notification-center-title-');

    /** Id of the panel element, set by the trigger so it can point `aria-controls` at it.
     * @docs-private */
    protected panelId: string;

    /** @docs-private */
    protected popoverMode: boolean;

    /** Distance in pixels from the bottom of the list at which the next page is requested.
     * @docs-private */
    protected scrolledToBottomOffset: number = 0;

    /** Re-measures the list outside of a scroll event: on first render and whenever the state changes. */
    /** Whether a re-measurement is already queued for the next render. */
    private scrolledToBottomRecheckPending = false;

    private readonly scrolledToBottomRecheck = new Subject<void>();

    /** localized data
     * @docs-private */
    get localeData(): KbqNotificationCenterLocaleConfiguration {
        return this.configuration;
    }

    /**
     * Text of the panel's single live region. The panel keeps one persistent region and only changes
     * its text, because a region inserted together with its content is not reliably announced.
     * @docs-private
     */
    protected get statusMessage(): string {
        if (this.service.errorMode.value || this.service.loadMoreErrorMode.value) {
            return this.localeData.failedToLoadNotifications;
        }

        if (this.service.loadingMore.value) {
            return this.localeData.loadingMore;
        }

        return this.service.isEmpty ? this.localeData.noNotifications : '';
    }

    /** @docs-private */
    prefix = 'kbq-notification-center';
    /** @docs-private */
    trigger: KbqNotificationCenterTrigger;
    /** @docs-private */
    isTrapFocus: boolean = false;

    readonly switcher = viewChild.required<KbqButton>('notificationSwitcher');

    /** Scrollable list container; used to measure scroll position for infinite scroll. */
    private readonly scrollContainer = viewChild.required(KbqScrollbarViewport);

    get popoverHeight(): string {
        return this._popoverHeight;
    }

    set popoverHeight(value: string) {
        this._popoverHeight = value;

        if (value) {
            this.renderer.setStyle(
                this.elementRef.nativeElement,
                POPOVER_HEIGHT_PROPERTY,
                value,
                RendererStyleFlags2.DashCase
            );
        } else {
            this.renderer.removeStyle(
                this.elementRef.nativeElement,
                POPOVER_HEIGHT_PROPERTY,
                RendererStyleFlags2.DashCase
            );
        }
    }

    private _popoverHeight: string;

    constructor() {
        super();
    }

    ngAfterViewInit() {
        this.visibleChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((state) => {
            if (this.offset !== null && state) {
                applyPopupMargins(
                    this.renderer,
                    this.elementRef.nativeElement,
                    this.prefix,
                    `${this.offset!.toString()}px`
                );
            }

            this.setStickPosition();
        });

        this.service.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.changeDetectorRef.markForCheck();

            this.scheduleScrolledToBottomCheck();
        });

        // Restores the focus ring: the panel is opened from the keyboard, and a plain `focus()` would
        // land without one.
        this.switcher().focusViaKeyboard();

        this.subscribeToScrolledToBottom();
        this.subscribeToRevealLoadMoreRow();

        // A first page too short to overflow the viewport produces no scroll event at all, so measure
        // once the panel has rendered or infinite scroll would never start.
        this.scheduleScrolledToBottomCheck();
    }

    /** Removes a whole day group, keeping keyboard focus inside the panel.
     * @docs-private */
    protected removeGroup(group: KbqNotificationsGroup): void {
        this.restoreFocusAfterRemove();

        this.service.removeGroup(group);
    }

    /** Removes every notification, keeping keyboard focus inside the panel.
     * @docs-private */
    protected removeAll(): void {
        this.restoreFocusAfterRemove();

        this.service.removeAll();
    }

    /**
     * Moves focus to a surviving delete button — or to the list container when the last one is gone —
     * once the removal has rendered. Without it, focus falls back to `<body>` and the Escape handler
     * and the rest of the panel become unreachable.
     */
    restoreFocusAfterRemove(): void {
        afterNextRender(
            () => {
                const survivor = this.elementRef.nativeElement.querySelector<HTMLElement>(REMOVE_BUTTON_SELECTOR);

                if (survivor) {
                    survivor.focus();
                } else {
                    this.focusScrollContainer();
                }
            },
            { injector: this.injector }
        );
    }

    /** Retries loading the next page from the bottom error row.
     * @docs-private */
    protected retryLoadMore(): void {
        // The retry button is about to unmount; keep keyboard focus inside the panel instead of
        // letting it fall back to <body>.
        this.focusScrollContainer();

        // Clear the bottom error state here so the spinner and the error row can never be shown at
        // the same time, regardless of what the consumer's `onNextPage` handler does.
        this.service.setLoadMoreErrorMode(false);

        this.service.onNextPage.next();
    }

    /**
     * Requests the next page (via `service.onNextPage`) once the list is scrolled to within
     * `scrolledToBottomOffset` pixels of the bottom. Two triggers feed it: the user scrolling, and a
     * re-measurement after the panel's state has rendered. The latter keeps paging when a freshly
     * loaded page is too short to overflow the viewport — otherwise no further scroll event would fire
     * and pagination would stall. Suppressed while a load is in flight, errored, or when there is
     * nothing more to load.
     */
    private subscribeToScrolledToBottom(): void {
        const scrolledToBottom$ = this.scrollContainer().scrollChanges.pipe(
            auditTime(SCROLLED_TO_BOTTOM_AUDIT_TIME),
            map(() => this.isScrolledToBottom()),
            distinctUntilChanged(),
            filter(Boolean)
        );

        // Deliberately without `distinctUntilChanged`: a re-measurement that finds the list still at
        // the bottom must keep paging even though the previous measurement said the same.
        const rechecked$ = this.scrolledToBottomRecheck.pipe(
            auditTime(SCROLLED_TO_BOTTOM_AUDIT_TIME),
            filter(() => this.isScrolledToBottom())
        );

        merge(scrolledToBottom$, rechecked$)
            .pipe(takeUntilDestroyed(this.destroyRef))
            // `scrollChanges` is `CdkScrollable.elementScrolled()` and emits outside Angular's zone, so
            // re-enter before touching consumer-facing state.
            .subscribe(() => this.ngZone.run(() => this.requestNextPage()));
    }

    /** Queues a re-measurement for after the next render, when the DOM reflects the new state. */
    private scheduleScrolledToBottomCheck(): void {
        // At most one pending re-measurement: `requestNextPage` flips the service's own loading flags,
        // which ping `changes` in turn, so an unguarded schedule feeds itself for as long as the list
        // reports it is at the bottom — each render callback queueing the next one.
        if (this.scrolledToBottomRecheckPending) {
            return;
        }

        this.scrolledToBottomRecheckPending = true;

        afterNextRender(
            () => {
                this.scrolledToBottomRecheckPending = false;

                this.scrolledToBottomRecheck.next();
            },
            { injector: this.injector }
        );
    }

    /** Whether the list is scrolled to within `scrolledToBottomOffset` pixels of the bottom.
     * Sub-pixel measurement error is absorbed by `SCROLLED_TO_BOTTOM_TOLERANCE`. */
    private isScrolledToBottom(): boolean {
        const { scrollTop, clientHeight, scrollHeight } = this.scrollContainer().getNativeElement();

        // A container that has not been laid out yet has no bottom to reach. Without this guard the
        // all-zero measurement reads as "at the bottom" and requests page after page into nothing.
        if (clientHeight === 0) {
            return false;
        }

        return scrollHeight - scrollTop - clientHeight <= this.scrolledToBottomOffset + SCROLLED_TO_BOTTOM_TOLERANCE;
    }

    /** Emits `onNextPage` unless a load is already in flight, errored, or there is nothing more to load. */
    private requestNextPage(): void {
        if (this.service.hasMore.value && !this.service.loadingMore.value && !this.service.loadMoreErrorMode.value) {
            this.service.onNextPage.next();
        }
    }

    /**
     * Reveals the bottom "load more" spinner / error row when it first appears. Both rows are appended
     * below the last item and can land outside the viewport (the next page is requested while the user
     * is up to `scrolledToBottomOffset` px above the true bottom). Only a genuine false->true transition
     * reveals the row: the BehaviorSubject's replayed current value is ignored (`pairwise` needs two
     * emissions), so the panel always opens scrolled to the top — reopening it while a load-more error
     * is still set never jumps to the bottom.
     */
    private subscribeToRevealLoadMoreRow(): void {
        const reveal = (source: BehaviorSubject<boolean>) =>
            source.pipe(
                distinctUntilChanged(),
                pairwise(),
                filter(([wasShown, isShown]) => !wasShown && isShown),
                auditTime(SCROLLED_TO_BOTTOM_AUDIT_TIME)
            );

        merge(reveal(this.service.loadingMore), reveal(this.service.loadMoreErrorMode))
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.scrollToBottom());
    }

    /** Scrolls the list container to its bottom so a freshly-appended bottom row becomes visible. */
    private scrollToBottom(): void {
        const { scrollHeight } = this.scrollContainer().getNativeElement();

        this.scrollContainer().scrollTo({ top: scrollHeight });
    }

    private focusScrollContainer(): void {
        const element = this.scrollContainer().getNativeElement();

        // tabindex -1 keeps the container out of the Tab order while allowing programmatic focus.
        element.setAttribute('tabindex', '-1');
        element.focus({ preventScroll: true });
    }

    /** @docs-private */
    updateClassMap(placement: string, customClass: string, size: KbqPopUpSizeValues) {
        super.updateClassMap(placement, customClass, { [`${this.prefix}_${size}`]: !!size });
    }

    /** @docs-private */
    updateTrapFocus(isTrapFocus: boolean): void {
        this.isTrapFocus = isTrapFocus;
    }

    /** @docs-private */
    escapeHandler() {
        this.hide(0);
    }
}

@Directive({
    selector: '[kbqNotificationCenterTrigger]',
    host: {
        '[class.kbq-notification-center_open]': 'isOpen',
        '[class.kbq-active]': 'hasClickTrigger && isOpen',
        '[attr.aria-expanded]': 'isOpen',
        '[attr.aria-controls]': 'isOpen ? panelId : null'
    },
    exportAs: 'kbqNotificationCenterTrigger'
})
export class KbqNotificationCenterTrigger
    extends KbqPopUpTrigger<KbqNotificationCenterComponent>
    implements AfterContentInit
{
    /** @docs-private */
    protected scrollStrategy: () => ScrollStrategy = inject(KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY);
    /** @docs-private */
    protected readonly service = inject(KbqNotificationCenterService);

    /** Id handed to the panel so `aria-controls` can point at it while it is open.
     * @docs-private */
    protected readonly panelId = inject(_IdGenerator).getId('kbq-notification-center-panel-');

    // not used
    /** @docs-private */
    arrow: boolean = false;
    /** @docs-private */
    customClass: string;
    /** @docs-private */
    content: string | TemplateRef<unknown>;

    /** Number of unread notifications */
    get unreadItemsCounter() {
        return this.service.unreadItemsCounter;
    }

    /** Placement of popUp */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input('kbqNotificationCenterPlacement') placement: KbqPopUpPlacementValues = PopUpPlacements.Right;

    /** Class that will be used in the background */
    readonly backdropClass = input<string>('cdk-overlay-transparent-backdrop');

    /** Class that will be used in the panel */
    readonly panelClass = input<string>('', { alias: 'kbqNotificationCenterPanelClass' });

    /** Offset of popUp */
    readonly offset = input<number, unknown>(defaultOffsetX, { transform: numberAttribute });

    /** Distance in pixels from the bottom of the list at which the next page is requested via `onNextPage`. */
    readonly scrolledToBottomOffset = input<number, unknown>(0, { transform: numberAttribute });

    /** Use popover or not */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get popoverMode(): boolean {
        return this._popoverMode;
    }

    set popoverMode(value: boolean) {
        if (value === this._popoverMode) {
            return;
        }

        this._popoverMode = value;

        // The placement in force before the mode took over is remembered rather than assumed: a consumer
        // may have bound one of its own, and turning the mode off used to leave the popover placement
        // behind for good.
        if (value) {
            this.placementBeforePopoverMode = { placement: this.placement, priority: this.placementPriority };

            this.placement = PopUpPlacements.Bottom;
            this.updatePlacementPriority(['bottomCenter', 'bottomLeft', 'bottomRight']);
        } else if (this.placementBeforePopoverMode) {
            this.placement = this.placementBeforePopoverMode.placement;
            this.updatePlacementPriority(this.placementBeforePopoverMode.priority as KbqPopUpPlacementValues[]);

            this.placementBeforePopoverMode = null;
        }
    }

    /** Placement and priority in force before `popoverMode` replaced them. */
    private placementBeforePopoverMode: {
        placement: KbqPopUpPlacementValues;
        priority: string | string[] | null;
    } | null = null;

    private _popoverMode: boolean = false;

    /** Set height of popover. Default is `calc(100vh - <navbar height>)`. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get popoverHeight(): string {
        return this._popoverHeight;
    }

    set popoverHeight(value: string) {
        this._popoverHeight = value;

        // Guarding on the open panel, not on its current height: the previous `instance?.popoverHeight`
        // check made the first set a no-op and made clearing the height impossible.
        if (this.instance) {
            this.instance.popoverHeight = value;
        }
    }

    private _popoverHeight: string;

    /** Whether the trigger is disabled. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
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
     * Additionally positions the element relative to the window side (Top, Right, Bottom and Left).
     * If container is specified, the positioning will be relative to it.
     * */
    // TODO: Skipped for migration because:
    //  This input overrides a field from a superclass, while the superclass field
    //  is not migrated.
    @Input() stickToWindow: KbqStickToWindowPlacementValues;

    /** Container for additional positioning, used with stickToWindow */
    // TODO: Skipped for migration because:
    //  This input overrides a field from a superclass, while the superclass field
    //  is not migrated.
    @Input() container: HTMLElement;

    /** @docs-private */
    get hasClickTrigger(): boolean {
        return this.trigger.includes(PopUpTriggers.Click);
    }

    /** Emits a change event whenever the placement state changes. */
    @Output('kbqPlacementChange') readonly placementChange = new EventEmitter<string>();

    /** Emits a change event whenever the visible state changes. */
    @Output('kbqVisibleChange') readonly visibleChange = new EventEmitter<boolean>();

    /** @docs-private */
    trigger: string = `${PopUpTriggers.Click}, ${PopUpTriggers.Keydown}`;

    /** @docs-private */
    protected originSelector = '.kbq-notification-center';

    /** @docs-private */
    protected get overlayConfig(): OverlayConfig {
        const defaultPanelClass = 'kbq-notification-center__panel';
        const panelClass = this.panelClass();

        return {
            panelClass: panelClass ? [defaultPanelClass, panelClass] : defaultPanelClass,
            hasBackdrop: false,
            backdropClass: this.backdropClass()
        };
    }

    constructor() {
        super();

        this.updatePlacementPriority(['right', 'rightBottom', 'rightTop']);
    }

    ngAfterContentInit(): void {
        // On close, return focus to the trigger. Suppressing the close on an inner scroll lives in
        // `closingActions()`, so no per-visibility subscription is needed here.
        this.visibleChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((visible: boolean) => {
            if (!visible) {
                this.focus();
            }
        });
    }

    /** @docs-private */
    updateData() {
        if (!this.instance) return;

        this.instance.panelId = this.panelId;
        this.instance.content = this.content;
        this.instance.arrow = this.arrow;
        this.instance.offset = this.offset();
        this.instance.popoverMode = this.popoverMode;
        this.instance.popoverHeight = this.popoverHeight;
        this.instance.scrolledToBottomOffset = this.scrolledToBottomOffset();

        this.instance.updateTrapFocus(this.trigger !== PopUpTriggers.Focus);

        if (this.isOpen) {
            this.updatePosition(true);
        }
    }

    /** Updates the current position.
     *
     * @docs-private */
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
    getOverlayHandleComponentType(): Type<KbqNotificationCenterComponent> {
        return KbqNotificationCenterComponent;
    }

    /** @docs-private */
    updateClassMap(newPlacement: string = this.placement) {
        if (!this.instance) return;

        this.instance.updateClassMap(POSITION_TO_CSS_MAP[newPlacement], this.customClass, PopUpSizes.Medium);
        this.instance.markForCheck();
    }

    /** @docs-private */
    closingActions() {
        return merge(
            this.overlayRef!.outsidePointerEvents(),
            this.overlayRef!.backdropClick(),
            // Only a scroll outside the panel should close it. The list viewport is a `CdkScrollable`,
            // so its own scrolling reaches the root `ScrollDispatcher` too — filtering it out here is
            // what keeps the panel open, instead of tagging the shared scrollable with a "prevent hide"
            // flag that would then follow it around the whole application.
            this.scrollDispatcher.scrolled().pipe(filter((scrollable) => !this.isInnerScroll(scrollable)))
        );
    }

    /** Whether a `ScrollDispatcher` emission originates from inside this panel's own scrollable content. */
    private isInnerScroll(scrollable: CdkScrollable | void): boolean {
        return (
            scrollable instanceof CdkScrollable &&
            !!scrollable.getElementRef().nativeElement.closest('.kbq-notification-center')
        );
    }
}

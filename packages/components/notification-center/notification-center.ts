import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FlexibleConnectedPositionStrategy, Overlay, OverlayConfig, ScrollStrategy } from '@angular/cdk/overlay';
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
    Input,
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
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButton, KbqButtonModule } from '@koobiq/components/button';
import {
    DateAdapter,
    KBQ_LOCALE_SERVICE,
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
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { KbqScrollbar, KbqScrollbarModule } from '@koobiq/components/scrollbar';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { Subscription, merge } from 'rxjs';
import { KbqNotificationCenterAnimations } from './notification-center-animations';
import { KbqNotificationCenterService } from './notification-center.service';
import { KbqNotificationItemComponent } from './notification-item';

const defaultOffsetX = 8;

/**default configuration of notification-center */
export const KBQ_NOTIFICATION_CENTER_DEFAULT_CONFIGURATION = ruRULocaleData.notificationCenter;

/** Injection Token for providing configuration of notification-center */
export const KBQ_NOTIFICATION_CENTER_CONFIGURATION = new InjectionToken('KbqNotificationCenterConfiguration');

/** @docs-private */
export const KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
    'kbq-notification-center-scroll-strategy'
);

/** @docs-private */
export function kbqNotificationCenterScrollStrategyFactory(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition({ scrollThrottle: 20 });
}

/** @docs-private */
export const KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: kbqNotificationCenterScrollStrategyFactory
};

/** @docs-private */
@Component({
    selector: 'kbq-notification-center',
    imports: [
        KbqIconModule,
        KbqBadgeModule,
        KbqScrollbarModule,
        KbqButtonModule,
        KbqDividerModule,
        KbqDropdownModule,
        KbqToolTipModule,
        AsyncPipe,
        KbqNotificationItemComponent,
        KbqLoaderOverlayModule
    ],
    templateUrl: './notification-center.html',
    styleUrls: ['./notification-center.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    host: {
        class: 'kbq-notification-center',
        '[class.kbq-notification-center_popover]': 'popoverMode',
        '(keydown.escape)': 'escapeHandler()'
    },
    animations: [KbqNotificationCenterAnimations.state]
})
export class KbqNotificationCenterComponent extends KbqPopUp implements AfterViewInit {
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    /** @docs-private */
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    /** @docs-private */
    protected readonly dateAdapter = inject(DateAdapter);
    /** @docs-private */
    protected readonly service = inject(KbqNotificationCenterService);

    @ViewChild(KbqScrollbar) private scrollContainer: KbqScrollbar;

    readonly externalConfiguration = inject(KBQ_NOTIFICATION_CENTER_CONFIGURATION, { optional: true });

    configuration;

    /** @docs-private */
    protected popoverMode: boolean;

    /** @docs-private */
    protected isTopOverflow: boolean = false;
    /** @docs-private */
    protected isBottomOverflow: boolean = false;

    /** localized data
     * @docs-private */
    get localeData() {
        return this.configuration;
    }

    /** @docs-private */
    prefix = 'kbq-notification-center';
    /** @docs-private */
    trigger: KbqNotificationCenterTrigger;
    /** @docs-private */
    isTrapFocus: boolean = false;

    @ViewChild('notificationSwitcher') switcher: KbqButton;

    get popoverHeight(): string {
        return this._popoverHeight;
    }

    set popoverHeight(value: string) {
        this._popoverHeight = value;

        this.elementRef.nativeElement.style.height = value;
    }

    private _popoverHeight: string;

    constructor() {
        super();

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!this.localeService) {
            this.initDefaultParams();
        }
    }

    ngAfterViewInit() {
        this.visibleChange.subscribe((state) => {
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

        this.service.changes.subscribe(() => this.changeDetectorRef.markForCheck());

        this.switcher.focus();

        setTimeout(this.checkOverflow);
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

    protected checkOverflow = () => {
        const nativeElement = this.scrollContainer.contentElement.nativeElement;

        const { scrollTop, offsetHeight, scrollHeight } = nativeElement;

        this.isTopOverflow = scrollTop > 0;

        this.isBottomOverflow = scrollTop + offsetHeight < scrollHeight;

        this.changeDetectorRef.markForCheck();
    };

    private updateLocaleParams = () => {
        this.configuration = this.externalConfiguration || this.localeService?.getParams('notificationCenter');

        this.changeDetectorRef.markForCheck();
    };

    private initDefaultParams() {
        this.configuration = KBQ_NOTIFICATION_CENTER_DEFAULT_CONFIGURATION;
    }
}

@Directive({
    selector: '[kbqNotificationCenterTrigger]',
    exportAs: 'kbqNotificationCenterTrigger',
    host: {
        '[class.kbq-notification-center_open]': 'isOpen',
        '[class.kbq-active]': 'hasClickTrigger && isOpen'
    }
})
export class KbqNotificationCenterTrigger
    extends KbqPopUpTrigger<KbqNotificationCenterComponent>
    implements AfterContentInit
{
    /** @docs-private */
    protected scrollStrategy: () => ScrollStrategy = inject(KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY);
    /** @docs-private */
    protected readonly service = inject(KbqNotificationCenterService);

    // not used
    /** @docs-private */
    arrow: boolean = false;
    /** @docs-private */
    customClass: string;
    /** @docs-private */
    private hasBackdrop: boolean = false;
    /** @docs-private */
    private size: KbqPopUpSizeValues = PopUpSizes.Medium;
    /** @docs-private */
    content: string | TemplateRef<any>;
    /** @docs-private */
    header: string | TemplateRef<any>;
    /** @docs-private */
    footer: string | TemplateRef<any>;

    /** Number of unread notifications */
    get unreadItemsCounter() {
        return this.service.unreadItemsCounter;
    }

    /** Placement of popUp */
    @Input('kbqNotificationCenterPlacement') placement: KbqPopUpPlacementValues = PopUpPlacements.Right;

    /** Class that will be used in the background */
    @Input() backdropClass: string = 'cdk-overlay-transparent-backdrop';

    /** Class that will be used in the panel */
    @Input('kbqNotificationCenterPanelClass') panelClass: string;

    /** Offset of popUp */
    @Input({ transform: numberAttribute }) offset: number | null = defaultOffsetX;

    /** Use popover or not */
    @Input({ transform: booleanAttribute })
    get popoverMode(): boolean {
        return this._popoverMode;
    }

    set popoverMode(value: boolean) {
        this._popoverMode = value;

        this.placement = PopUpPlacements.Bottom;
        this.updatePlacementPriority(['bottomCenter', 'bottomLeft', 'bottomRight']);
    }

    private _popoverMode: boolean = false;

    /** Set height of popover. Default is calc(100vh - 48px). 48px - height of navbar */
    @Input()
    get popoverHeight(): string {
        return this._popoverHeight;
    }

    set popoverHeight(value: string) {
        this._popoverHeight = value;

        if (this.instance?.popoverHeight) {
            this.instance.popoverHeight = value;
        }
    }

    private _popoverHeight: string;

    /** Whether the trigger is disabled. */
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
    @Input() stickToWindow: KbqStickToWindowPlacementValues;

    /** Container for additional positioning, used with stickToWindow */
    @Input() container: HTMLElement;

    /** @docs-private */
    get hasClickTrigger(): boolean {
        return this.trigger.includes(PopUpTriggers.Click);
    }

    /** Emits a change event whenever the placement state changes. */
    @Output('kbqPlacementChange') readonly placementChange = new EventEmitter();

    /** Emits a change event whenever the visible state changes. */
    @Output('kbqVisibleChange') readonly visibleChange = new EventEmitter<boolean>();

    /** @docs-private */
    trigger: string = `${PopUpTriggers.Click}, ${PopUpTriggers.Keydown}`;

    /** @docs-private */
    protected originSelector = '.kbq-notification-center';

    /** @docs-private */
    protected get overlayConfig(): OverlayConfig {
        const defaultPanelClass = 'kbq-notification-center__panel';

        return {
            panelClass: this.panelClass ? [defaultPanelClass, this.panelClass] : defaultPanelClass,
            hasBackdrop: this.hasBackdrop,
            backdropClass: this.backdropClass
        };
    }

    /** @docs-private */
    protected preventClosingByInnerScrollSubscription: Subscription;

    constructor() {
        super();

        this.updatePlacementPriority(['right', 'rightBottom', 'rightTop']);
    }

    ngAfterContentInit(): void {
        this.visibleChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((visible: boolean) => {
            if (visible) {
                // eslint-disable-next-line rxjs/no-nested-subscribe
                this.preventClosingByInnerScrollSubscription = this.closingActions().subscribe((event) => {
                    if (event && event['scrollDispatcher']) {
                        this.instance.setStickPosition();

                        event['kbqPopoverPreventHide'] = true;
                        event['type'] = 'click';
                    }
                });
            } else {
                this.preventClosingByInnerScrollSubscription.unsubscribe();
                this.focus();
            }
        });
    }

    /** @docs-private */
    updateData() {
        if (!this.instance) return;

        this.instance.header = this.header;
        this.instance.content = this.content;
        this.instance.arrow = this.arrow;
        this.instance.offset = this.offset;
        this.instance.footer = this.footer;
        this.instance.popoverMode = this.popoverMode;
        this.instance.popoverHeight = this.popoverHeight;

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

        this.instance.updateClassMap(POSITION_TO_CSS_MAP[newPlacement], this.customClass, this.size);
        this.instance.markForCheck();
    }

    /** @docs-private */
    closingActions() {
        return merge(
            this.overlayRef!.outsidePointerEvents(),
            this.overlayRef!.backdropClick(),
            this.scrollDispatcher.scrolled()
        );
    }
}

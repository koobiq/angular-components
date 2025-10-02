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
    Directive,
    EventEmitter,
    InjectionToken,
    Input,
    OnInit,
    Output,
    TemplateRef,
    Type,
    ViewEncapsulation,
    booleanAttribute,
    inject,
    numberAttribute
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import {
    KbqOptionModule,
    KbqPopUp,
    KbqPopUpTrigger,
    POSITION_TO_CSS_MAP,
    PopUpPlacements,
    PopUpSizes,
    PopUpTriggers,
    applyPopupMargins
} from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';
import { Subscription, merge } from 'rxjs';
import { KbqNotificationCenterAnimations } from './notification-center-animations';

const defaultOffsetYWithArrow = 8;

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
    standalone: true,
    selector: 'kbq-notification-center',
    templateUrl: './notification-center.html',
    preserveWhitespaces: false,
    styleUrls: ['./notification-center.scss'],
    host: {
        class: 'kbq-notification-center'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconModule,
        KbqDividerModule,
        KbqBadgeModule,
        KbqDropdownModule,
        KbqScrollbarModule,
        KbqOptionModule
    ],
    animations: [KbqNotificationCenterAnimations.state]
})
export class KbqNotificationCenterComponent extends KbqPopUp implements AfterViewInit {
    /** @docs-private */
    prefix = 'kbq-notification-center';

    /** @docs-private */
    trigger: KbqNotificationCenterTrigger;

    /** @docs-private */
    isTrapFocus: boolean = false;

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
        });
    }

    /** @docs-private */
    updateClassMap(placement: string, customClass: string, size: PopUpSizes) {
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
    standalone: true,
    selector: '[kbqNotificationCenter]',
    exportAs: 'kbqNotificationCenter',
    host: {
        '[class.kbq-notification-center_open]': 'isOpen',
        '[class.kbq-active]': 'hasClickTrigger && isOpen'
    }
})
export class KbqNotificationCenterTrigger
    extends KbqPopUpTrigger<KbqNotificationCenterComponent>
    implements AfterContentInit, OnInit
{
    /** @docs-private */
    protected scrollStrategy: () => ScrollStrategy = inject(KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY);

    // not used
    /** @docs-private */
    arrow: boolean = false;
    /** @docs-private */
    customClass: string;
    /** @docs-private */
    private hasBackdrop: boolean = false;
    /** @docs-private */
    private size: PopUpSizes = PopUpSizes.Medium;
    /** @docs-private */
    content: string | TemplateRef<any>;
    /** @docs-private */
    header: string | TemplateRef<any>;
    /** @docs-private */
    footer: string | TemplateRef<any>;
    /** @docs-private */
    private closeOnScroll: null;

    /** Placement of popUp */
    @Input('kbqNotificationCenterPlacement') placement: PopUpPlacements = PopUpPlacements.BottomLeft;

    /** Class that will be used in the background */
    @Input() backdropClass: string = 'cdk-overlay-transparent-backdrop';

    /** Offset of popUp */
    @Input({ transform: numberAttribute }) offset: number | null = defaultOffsetYWithArrow;

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
        return {
            panelClass: 'kbq-notification-center__panel',
            hasBackdrop: this.hasBackdrop,
            backdropClass: this.backdropClass
        };
    }

    /** @docs-private */
    protected preventClosingByInnerScrollSubscription: Subscription;

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

        this.visibleChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((visible: boolean) => {
            if (visible) {
                // eslint-disable-next-line rxjs/no-nested-subscribe
                this.preventClosingByInnerScrollSubscription = this.closingActions().subscribe((event) => {
                    if (event['scrollDispatcher']) {
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

        this.instance.updateTrapFocus(this.trigger !== PopUpTriggers.Focus);

        if (this.isOpen) {
            this.updatePosition(true);
        }
    }

    /** Updates the current position.
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

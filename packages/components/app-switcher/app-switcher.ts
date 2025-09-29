import { CdkTrapFocus } from '@angular/cdk/a11y';
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
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import {
    KbqComponentColors,
    KbqOptionModule,
    KbqPopUp,
    KbqPopUpTrigger,
    POSITION_TO_CSS_MAP,
    PopUpSizes,
    PopUpTriggers,
    applyPopupMargins
} from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInput, KbqInputModule } from '@koobiq/components/input';
import { defaultOffsetYWithArrow } from '@koobiq/components/popover';
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';
import { Subscription, merge } from 'rxjs';
import { kbqAppSwitcherAnimations } from './app-switcher-animations';
import { KbqAppSwitcherApp } from './app-switcher-app';
import { KbqAppSwitcherDropdownApp } from './app-switcher-dropdown-app';
import { KbqAppSwitcherDropdownSite } from './app-switcher-dropdown-site';

export interface KbaAppSwitcherApp {
    name: string;
    id: string | number;
    type: string | number;
    icon?: string;
    caption?: string;
    apps?: KbaAppSwitcherApp[];
}

export interface KbaAppSwitcherSite {
    name: string;
    id: string | number;
    status?: string;
    icon?: string;
    apps: KbaAppSwitcherApp[];
}

@Component({
    standalone: true,
    selector: 'kbq-app-switcher',
    templateUrl: './app-switcher.html',
    preserveWhitespaces: false,
    styleUrls: ['./app-switcher.scss'],
    host: {
        class: 'kbq-app-switcher'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        FormsModule,
        KbqDividerModule,
        KbqBadgeModule,
        KbqIcon,
        KbqDropdownModule,
        KbqAppSwitcherDropdownApp,
        KbqAppSwitcherDropdownSite,
        KbqAppSwitcherApp,
        KbqScrollbarModule,
        KbqOptionModule
    ],
    animations: [kbqAppSwitcherAnimations.state]
})
export class KbqAppSwitcher extends KbqPopUp implements AfterViewInit {
    protected readonly componentColors = KbqComponentColors;

    searchValue: string = '';

    get withSites(): boolean {
        return !!this.trigger.sites.length;
    }

    prefix = 'kbq-app-switcher';

    trigger: KbqAppSwitcherTrigger;

    isTrapFocus: boolean = false;

    protected activeSite;
    protected activeApp;

    @ViewChild(KbqInput) input: KbqInput;
    @ViewChild('appSwitcherContent') appSwitcherContent: ElementRef<HTMLDivElement>;
    @ViewChild('appSwitcher') elementRef: ElementRef;
    @ViewChild('otherSites') otherSites: KbqDropdownTrigger;
    @ViewChild(CdkTrapFocus) cdkTrapFocus: CdkTrapFocus;

    ngAfterViewInit() {
        if (this.input) {
            this.input.focus();
        }

        if (!this.appSwitcherContent) return;

        this.cdkTrapFocus.focusTrap.focusFirstTabbableElement();

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

    updateClassMap(placement: string, customClass: string, size: PopUpSizes) {
        super.updateClassMap(placement, customClass, { [`${this.prefix}_${size}`]: !!size });
    }

    updateTrapFocus(isTrapFocus: boolean): void {
        this.isTrapFocus = isTrapFocus;
    }

    onSearchChange(value: string) {
        this.searchValue = value;
        console.log('onSearchChange: ', value);
    }

    onEscape() {
        this.hide(0);
    }

    selectAppInSite(site, app) {
        this.trigger.selectedSite = site;
        this.trigger.selectedApp = app;

        this.trigger.selectedSiteChanges.emit(site);
        this.trigger.selectedAppChanges.emit(site);
    }
}

export const KBQ_APP_SWITCHER_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
    'kbq-app-switcher-scroll-strategy'
);

/** @docs-private */
export function kbqAppSwitcherScrollStrategyFactory(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition({ scrollThrottle: 20 });
}

/** @docs-private */
export const KBQ_APP_SWITCHER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: KBQ_APP_SWITCHER_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: kbqAppSwitcherScrollStrategyFactory
};

@Directive({
    standalone: true,
    selector: '[kbqAppSwitcher]',
    exportAs: 'kbqAppSwitcher',
    host: {
        '[class.kbq-app-switcher_open]': 'isOpen',
        '[class.kbq-active]': 'hasClickTrigger && isOpen',
        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()'
    }
})
export class KbqAppSwitcherTrigger<
        S extends KbaAppSwitcherSite = KbaAppSwitcherSite,
        A extends KbaAppSwitcherApp = KbaAppSwitcherApp
    >
    extends KbqPopUpTrigger<KbqAppSwitcher>
    implements AfterContentInit, OnInit
{
    protected scrollStrategy: () => ScrollStrategy = inject(KBQ_APP_SWITCHER_SCROLL_STRATEGY);

    // not used
    arrow: boolean = false;
    customClass: string;
    private hasBackdrop: boolean = false;
    private size: PopUpSizes = PopUpSizes.Medium;
    content: string | TemplateRef<any>;
    header: string | TemplateRef<any>;
    footer: string | TemplateRef<any>;
    private closeOnScroll: null;

    @Input({ transform: booleanAttribute }) search: boolean;

    @Input()
    get sites(): S[] {
        return this._parsedSites;
    }

    set sites(value: S[]) {
        console.log('set sites(value: S[]) {: ');

        this._parsedSites = [];

        value.forEach((site: S) => {
            const newSite: S = { ...site };

            const groupedApps: any = {};

            site.apps.forEach((app) => {
                if (groupedApps[app.type]) {
                    groupedApps[app.type].apps.push(app);
                } else {
                    groupedApps[app.type] = {
                        name: app.type,
                        apps: []
                    };
                }
            });

            if (Object.values(groupedApps).length > 1) {
                newSite.apps = Object.values(groupedApps);
            }

            this._parsedSites.push(newSite);
        });
    }

    private _parsedSites: S[];

    @Input() selectedSite: S;

    @Input() apps: A[];
    @Input() selectedApp: A;

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

    trigger: string = `${PopUpTriggers.Click}, ${PopUpTriggers.Keydown}`;

    get hasClickTrigger(): boolean {
        return this.trigger.includes(PopUpTriggers.Click);
    }

    @Input() backdropClass: string = 'cdk-overlay-transparent-backdrop';

    @Input({ transform: numberAttribute }) offset: number | null = defaultOffsetYWithArrow;

    @Output('kbqPlacementChange') readonly placementChange = new EventEmitter();

    @Output('kbqVisibleChange') readonly visibleChange = new EventEmitter<boolean>();

    @Output() readonly selectedSiteChanges = new EventEmitter<any>();
    @Output() readonly selectedAppChanges = new EventEmitter<any>();

    protected originSelector = '.kbq-app-switcher';

    protected get overlayConfig(): OverlayConfig {
        return {
            panelClass: 'kbq-app-switcher__panel',
            hasBackdrop: this.hasBackdrop,
            backdropClass: this.backdropClass
        };
    }

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

    /** Updates the current position. */
    updatePosition(reapplyPosition: boolean = false) {
        this.overlayRef = this.createOverlay();

        const position = (this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy)
            .withPositions(this.getAdjustedPositions())
            .withPush(true);

        if (reapplyPosition) {
            setTimeout(() => position.reapplyLastPosition());
        }
    }

    getOverlayHandleComponentType(): Type<KbqAppSwitcher> {
        return KbqAppSwitcher;
    }

    updateClassMap(newPlacement: string = this.placement) {
        if (!this.instance) return;

        this.instance.updateClassMap(POSITION_TO_CSS_MAP[newPlacement], this.customClass, this.size);
        this.instance.markForCheck();
    }

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

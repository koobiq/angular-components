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
    ViewChild,
    ViewEncapsulation,
    booleanAttribute,
    inject,
    numberAttribute
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import {
    KBQ_LOCALE_SERVICE,
    KbqOptionModule,
    KbqPopUp,
    KbqPopUpPlacementValues,
    KbqPopUpSizeValues,
    KbqPopUpTrigger,
    POSITION_TO_CSS_MAP,
    PopUpPlacements,
    PopUpSizes,
    PopUpTriggers,
    applyPopupMargins,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqInputModule } from '@koobiq/components/input';
import { defaultOffsetYWithArrow } from '@koobiq/components/popover';
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';
import { Subscription, merge } from 'rxjs';
import { kbqAppSwitcherAnimations } from './app-switcher-animations';
import { KbqAppSwitcherDropdownApp } from './app-switcher-dropdown-app';
import { KbqAppSwitcherDropdownSite } from './app-switcher-dropdown-site';
import { KbqAppSwitcherListItem } from './kbq-app-switcher-list-item';

export interface KbqAppSwitcherApp {
    name: string;
    id: string | number;
    type?: string | number;
    icon: string;
    caption?: string;
    aliases?: KbqAppSwitcherApp[];
    link?: string;
}

export interface KbqAppSwitcherSite {
    name: string;
    id: string | number;
    status?: string;
    icon?: string;
    apps: KbqAppSwitcherApp[];
}

/** @docs-private */
export function defaultGroupBy(
    app: KbqAppSwitcherApp,
    groups: Record<string, KbqAppSwitcherApp>,
    untyped: KbqAppSwitcherApp[]
) {
    if (!app.type) {
        untyped.push(app);
    } else {
        const appType = app.type.toString();

        if (groups[appType]) {
            groups[appType].aliases!.push(app);
        } else {
            groups[appType] = {
                name: appType,
                aliases: [app],
                icon: app.icon,
                id: ''
            };
        }
    }
}

export const KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_SEARCH: number = 7;
export const KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_GROUPING: number = 3;

/** @docs-private */
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

/** default configuration of app-switcher */
/** @docs-private */
export const KBQ_APP_SWITCHER_DEFAULT_CONFIGURATION = ruRULocaleData.appSwitcher;

/** Injection Token for providing configuration of app-switcher */
/** @docs-private */
export const KBQ_APP_SWITCHER_CONFIGURATION = new InjectionToken('KbqAppSwitcherConfiguration');

/** @docs-private */
@Component({
    selector: 'kbq-app-switcher',
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
        KbqOptionModule,
        KbqAppSwitcherDropdownApp,
        KbqAppSwitcherDropdownSite,
        KbqAppSwitcherListItem
    ],
    templateUrl: './app-switcher.html',
    styleUrls: ['./app-switcher.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    host: {
        class: 'kbq-app-switcher'
    },
    animations: [kbqAppSwitcherAnimations.state]
})
export class KbqAppSwitcherComponent extends KbqPopUp implements AfterViewInit {
    /** @docs-private */
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });

    readonly externalConfiguration = inject(KBQ_APP_SWITCHER_CONFIGURATION, { optional: true });

    configuration;

    /** localized data
     * @docs-private */
    get localeData() {
        return this.configuration;
    }

    /** @docs-private */
    readonly searchControl = new FormControl('');

    /** @docs-private */
    filteredSites: KbqAppSwitcherSite[];

    /** @docs-private */
    prefix = 'kbq-app-switcher';

    /** @docs-private */
    @Input() trigger: KbqAppSwitcherTrigger;

    /** @docs-private */
    isTrapFocus: boolean = false;

    /** @docs-private */
    protected activeSite: KbqAppSwitcherSite;
    /** @docs-private */
    protected activeApp: KbqAppSwitcherApp;

    /** @docs-private */
    @ViewChild(KbqInput) input: KbqInput;
    /** @docs-private */
    @ViewChild('otherSites') otherSites: KbqDropdownTrigger;

    constructor() {
        super();

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!this.localeService) {
            this.initDefaultParams();
        }
    }

    ngAfterViewInit() {
        if (this.input) {
            this.input.focus();
        }

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

        this.searchControl.valueChanges.subscribe((value) => (this.filteredSites = this.filterSites(value)));
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

    /** @docs-private */
    selectAppInSite(site: KbqAppSwitcherSite, app: KbqAppSwitcherApp) {
        this.trigger.selectedSite = site;
        this.trigger.selectedApp = app;

        this.trigger.selectedSiteChange.emit(site);
        this.trigger.selectedAppChange.emit(app);
    }

    private filterSites(query: string | null): KbqAppSwitcherSite[] {
        const filteredSites = structuredClone(this.trigger.originalSites);

        return query
            ? filteredSites.filter((site) => {
                  const filteredApps = site.apps.filter((app) => app.name.toLowerCase().includes(query.toLowerCase()));

                  if (filteredApps.length) {
                      site.apps = filteredApps;

                      return true;
                  }

                  return false;
              })
            : filteredSites;
    }

    private updateLocaleParams = () => {
        this.configuration = this.externalConfiguration || this.localeService?.getParams('appSwitcher');

        this.changeDetectorRef.markForCheck();
    };

    private initDefaultParams() {
        this.configuration = KBQ_APP_SWITCHER_DEFAULT_CONFIGURATION;
    }
}

@Directive({
    selector: '[kbqAppSwitcher]',
    exportAs: 'kbqAppSwitcher',
    host: {
        '[class.kbq-app-switcher_open]': 'isOpen',
        '[class.kbq-active]': 'hasClickTrigger && isOpen',
        '(keydown)': 'keydownHandler($event)',
        '(touchend)': 'touchendHandler()'
    }
})
export class KbqAppSwitcherTrigger
    extends KbqPopUpTrigger<KbqAppSwitcherComponent>
    implements AfterContentInit, OnInit
{
    /** @docs-private */
    protected scrollStrategy: () => ScrollStrategy = inject(KBQ_APP_SWITCHER_SCROLL_STRATEGY);

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
    /** @docs-private */
    private closeOnScroll: null;

    /** Whether search is used or not */
    get withSearch(): boolean {
        return this.appsCount > KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_SEARCH;
    }

    /** Number of applications to choose from
     * @docs-private */
    get appsCount(): number {
        return this.originalSites.reduce((acc, site) => acc + site.apps.length, 0);
    }

    /** Whether the sites are used or not
     * @docs-private */
    get sitesMode(): boolean {
        return this.originalSites.length > 1;
    }

    /** @docs-private */
    get currentApps() {
        return this.sitesMode ? this.selectedSite.apps : this._parsedApps;
    }

    /** Selected application */
    @Input() selectedApp: KbqAppSwitcherApp;

    /** Placement of popUp */
    @Input('kbqAppSwitcherPlacement') placement: KbqPopUpPlacementValues = PopUpPlacements.BottomLeft;

    /** Class that will be used in the background */
    @Input() backdropClass: string = 'cdk-overlay-transparent-backdrop';

    /** Offset of popUp */
    @Input({ transform: numberAttribute }) offset: number | null = defaultOffsetYWithArrow;

    /** Array of sites */
    @Input()
    get sites(): KbqAppSwitcherSite[] {
        return this._parsedSites;
    }

    set sites(value: KbqAppSwitcherSite[]) {
        this.originalSites = value;

        if (this.originalSites.length === 1) {
            this._parsedApps = this.makeGroupsForApps(
                this.originalSites[0].apps,
                KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_GROUPING
            );
        } else {
            this._parsedSites = [];

            value.forEach((site: KbqAppSwitcherSite) => {
                const newSite: KbqAppSwitcherSite = { ...site, apps: [] };

                newSite.apps = this.makeGroupsForApps(site.apps, KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_GROUPING);

                this._parsedSites.push(newSite);
            });
        }
    }

    private _parsedSites: KbqAppSwitcherSite[];

    /**
     * @deprecated Will be removed in next major release, use `sites` with one element instead.
     */
    @Input()
    get apps(): KbqAppSwitcherApp[] {
        return this._parsedApps;
    }

    set apps(apps: KbqAppSwitcherApp[]) {
        this.originalApps = apps;

        this._parsedApps = this.makeGroupsForApps(this.originalApps, KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_GROUPING);
    }

    private makeGroupsForApps(apps: KbqAppSwitcherApp[], minAppsForGrouping: number): KbqAppSwitcherApp[] {
        const groups: Record<string, KbqAppSwitcherApp> = {};
        const untyped: KbqAppSwitcherApp[] = [];
        const groupedApps: KbqAppSwitcherApp[] = [];

        apps.forEach((app) => {
            this.groupBy(app, groups, untyped);
        });

        Object.values(groups).forEach((group) => {
            if (group.aliases && group.aliases.length > minAppsForGrouping) {
                groupedApps.push(group);
            } else {
                untyped.push(...group.aliases!);
            }
        });

        groupedApps.push(...untyped);

        return groupedApps;
    }

    private _parsedApps: KbqAppSwitcherApp[];

    /** Function to group the apps by type. The first argument is an app object with type.
     * The second is a groups object and third is an array for untyped apps */
    @Input()
    get groupBy() {
        return this._groupBy;
    }

    set groupBy(
        fn: (app: KbqAppSwitcherApp, groups: Record<string, KbqAppSwitcherApp>, untyped: KbqAppSwitcherApp[]) => void
    ) {
        if (typeof fn !== 'function') {
            throw new Error('The argument must be a function');
        }

        this._groupBy = fn;
    }

    private _groupBy = defaultGroupBy;

    /** Selected site */
    @Input()
    get selectedSite(): KbqAppSwitcherSite {
        return this._parsedSelectedSite;
    }

    set selectedSite(value: KbqAppSwitcherSite) {
        const originValue = this.originalSites.find((site) => value.id === site.id) as KbqAppSwitcherSite;
        const newSite: KbqAppSwitcherSite = { ...originValue, apps: [] };

        newSite.apps = this.makeGroupsForApps(originValue.apps, KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_GROUPING);

        this._parsedSelectedSite = newSite;
    }

    private _parsedSelectedSite: KbqAppSwitcherSite;

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
    @Output() readonly selectedSiteChange = new EventEmitter<KbqAppSwitcherSite>();
    /** @docs-private */
    @Output() readonly selectedAppChange = new EventEmitter<KbqAppSwitcherApp>();

    /** @docs-private */
    trigger: string = `${PopUpTriggers.Click}, ${PopUpTriggers.Keydown}`;

    /** @docs-private */
    originalSites: KbqAppSwitcherSite[];
    /** @docs-private */
    originalApps: KbqAppSwitcherApp[];

    /** @docs-private */
    protected originSelector = '.kbq-app-switcher';

    /** @docs-private */
    protected get overlayConfig(): OverlayConfig {
        return {
            panelClass: 'kbq-app-switcher__panel',
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
    getOverlayHandleComponentType(): Type<KbqAppSwitcherComponent> {
        return KbqAppSwitcherComponent;
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

import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    CdkScrollable,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    ScrollStrategy
} from '@angular/cdk/overlay';
import { AsyncPipe } from '@angular/common';
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
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInput, KbqInputModule } from '@koobiq/components/input';
import { defaultOffsetYWithArrow } from '@koobiq/components/popover';
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';
import { Subscription, merge } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { kbqAppSwitcherAnimations } from './app-switcher-animations';
import { KbqAppSwitcherDropdownApp } from './app-switcher-dropdown-app';
import { KbqAppSwitcherDropdownSite } from './app-switcher-dropdown-site';
import { KbqAppSwitcherListItem } from './kbq-app-switcher-list-item';

export interface KbqAppSwitcherApp {
    name: string;
    id: string | number;
    type?: string | number;
    icon?: string;
    caption?: string;
    aliases?: KbqAppSwitcherApp[];
    link?: string;
}

export interface KbaAppSwitcherSite {
    name: string;
    id: string | number;
    status?: string;
    icon?: string;
    apps: KbqAppSwitcherApp[];
}

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
                id: ''
            };
        }
    }
}

export const MIN_APPS_FOR_ENABLE_SEARCH: number = 7;
export const MIN_APPS_FOR_ENABLE_GROUPING: number = 3;

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
        KbqAppSwitcherListItem,
        KbqScrollbarModule,
        KbqOptionModule,
        ReactiveFormsModule,
        AsyncPipe
    ],
    animations: [kbqAppSwitcherAnimations.state]
})
export class KbqAppSwitcher extends KbqPopUp implements AfterViewInit {
    readonly searchControl = new FormControl('');

    readonly filteredSites = this.searchControl.valueChanges.pipe(
        startWith(''),
        map((query) => this.filterSites(query))
    );

    get withSites(): boolean {
        return this.trigger.sitesMode;
    }

    prefix = 'kbq-app-switcher';

    trigger: KbqAppSwitcherTrigger;

    isTrapFocus: boolean = false;

    protected activeSite: KbaAppSwitcherSite;
    protected activeApp: KbqAppSwitcherApp;

    @ViewChild(KbqInput) input: KbqInput;
    @ViewChild('otherSites') otherSites: KbqDropdownTrigger;

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
    }

    updateClassMap(placement: string, customClass: string, size: PopUpSizes) {
        super.updateClassMap(placement, customClass, { [`${this.prefix}_${size}`]: !!size });
    }

    updateTrapFocus(isTrapFocus: boolean): void {
        this.isTrapFocus = isTrapFocus;
    }

    onEscape() {
        this.hide(0);
    }

    selectAppInSite(site, app: KbqAppSwitcherApp) {
        this.trigger.selectedSite = site;
        this.trigger.selectedApp = app;

        this.trigger.selectedSiteChange.emit(site);
        this.trigger.selectedAppChange.emit(app);
    }

    private filterSites(query: string | null): KbaAppSwitcherSite[] {
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
}

export const KBQ_APP_SWITCHER_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
    'kbq-app-switcher-scroll-strategy'
);

// @docs-private
export function kbqAppSwitcherScrollStrategyFactory(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition({ scrollThrottle: 20 });
}

// @docs-private
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
export class KbqAppSwitcherTrigger extends KbqPopUpTrigger<KbqAppSwitcher> implements AfterContentInit, OnInit {
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

    get withSearch(): boolean {
        return this.appsCount > MIN_APPS_FOR_ENABLE_SEARCH;
    }

    get appsCount(): number {
        if (this.sitesMode) {
            return this.originalSites.reduce((acc, site) => acc + site.apps.length, 0);
        }

        return this.originalApps.length;
    }

    get sitesMode(): boolean {
        return this.originalSites?.length > 0;
    }

    get currentApps() {
        return this.sitesMode ? this.selectedSite.apps : this._parsedApps;
    }

    @Input('kbqAppSwitcherPlacement') placement: PopUpPlacements = PopUpPlacements.BottomLeft;

    @Input()
    get sites(): KbaAppSwitcherSite[] {
        return this._parsedSites;
    }

    set sites(value: KbaAppSwitcherSite[]) {
        this.originalSites = value;

        this._parsedSites = [];

        value.forEach((site: KbaAppSwitcherSite) => {
            const newSite: KbaAppSwitcherSite = { ...site, apps: [] };

            newSite.apps = this.makeGroupsForApps(site.apps, MIN_APPS_FOR_ENABLE_GROUPING);

            this._parsedSites.push(newSite);
        });
    }

    private _parsedSites: KbaAppSwitcherSite[];

    @Input()
    get apps(): KbqAppSwitcherApp[] {
        return this._parsedApps;
    }

    set apps(apps: KbqAppSwitcherApp[]) {
        this.originalApps = apps;

        this._parsedApps = this.makeGroupsForApps(this.originalApps, MIN_APPS_FOR_ENABLE_GROUPING);
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

    originalSites: KbaAppSwitcherSite[];
    originalApps: KbqAppSwitcherApp[];

    // Function to group the apps by type. The first argument is an object with app types. The second is an app
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

    @Input()
    get selectedSite(): KbaAppSwitcherSite {
        return this._parsedSelectedSite;
    }

    set selectedSite(value: KbaAppSwitcherSite) {
        const originValue = this.originalSites.find((site) => value.id === site.id) as KbaAppSwitcherSite;
        const newSite: KbaAppSwitcherSite = { ...originValue, apps: [] };

        newSite.apps = this.makeGroupsForApps(originValue.apps, MIN_APPS_FOR_ENABLE_GROUPING);

        this._parsedSelectedSite = newSite;
    }

    @Input() selectedApp: KbqAppSwitcherApp;

    private _parsedSelectedSite: KbaAppSwitcherSite;

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

    @Output() readonly selectedSiteChange = new EventEmitter<KbaAppSwitcherSite>();
    @Output() readonly selectedAppChange = new EventEmitter<KbqAppSwitcherApp>();

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

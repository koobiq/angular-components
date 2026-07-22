import { Directionality } from '@angular/cdk/bidi';
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
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    Type,
    ViewChildren,
    ViewEncapsulation,
    booleanAttribute,
    inject,
    numberAttribute,
    output,
    viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import {
    DOWN_ARROW,
    ENTER,
    ESCAPE,
    FocusKeyManager,
    KBQ_LOCALE_SERVICE,
    KbqOptionModule,
    KbqPopUp,
    KbqPopUpPlacementValues,
    KbqPopUpSizeValues,
    KbqPopUpTrigger,
    LEFT_ARROW,
    POSITION_TO_CSS_MAP,
    PopUpPlacements,
    PopUpSizes,
    PopUpTriggers,
    RIGHT_ARROW,
    SPACE,
    UP_ARROW,
    applyPopupMargins,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownItem, KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqInputModule } from '@koobiq/components/input';
import { defaultOffsetYWithArrow } from '@koobiq/components/popover';
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';
import { Subscription, merge } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { kbqAppSwitcherAnimations } from './app-switcher-animations';
import { KbqAppSwitcherDropdownApp } from './app-switcher-dropdown-app';
import { KbqAppSwitcherDropdownSite } from './app-switcher-dropdown-site';
import { KbqAppSwitcherListItem } from './kbq-app-switcher-list-item';

export interface KbqAppSwitcherApp {
    name: string;
    id: string | number;
    type?: string | number;
    /** Inline SVG markup for the application icon. Use this for SVG icons that should be rendered directly in the DOM. */
    icon?: string;
    /** Path to the icon file (URL or relative path). */
    iconSrc?: string;
    caption?: string;
    aliases?: KbqAppSwitcherApp[];
    link?: string;
}

export interface KbqAppSwitcherSite {
    name: string;
    id: string | number;
    status?: string;
    /** Inline SVG markup for the site icon. Use this for SVG icons that should be rendered directly in the DOM. */
    icon?: string;
    /** Path to the icon file (URL or relative path). */
    iconSrc?: string;
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
                iconSrc: app.iconSrc,
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-app-switcher',
        '(keydown)': 'keydownHandler($event)',
        '(focusin)': 'focusinHandler($event)'
    },
    animations: [kbqAppSwitcherAnimations.state],
    preserveWhitespaces: false
})
export class KbqAppSwitcherComponent extends KbqPopUp implements AfterViewInit, OnDestroy {
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
    // TODO: Skipped for migration because:
    //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
    //  and migrating would break narrowing currently.
    @Input() trigger: KbqAppSwitcherTrigger;

    /** @docs-private */
    isTrapFocus: boolean = false;

    /** @docs-private */
    protected activeSite: KbqAppSwitcherSite;
    /** @docs-private */
    protected activeApp: KbqAppSwitcherApp;

    /** @docs-private */
    readonly input = viewChild(KbqInput);
    /** @docs-private */
    readonly otherSites = viewChild.required<KbqDropdownTrigger>('otherSites');

    /** @docs-private */
    @ViewChildren(KbqDropdownItem) protected allItems: QueryList<KbqDropdownItem>;

    /** Roving-focus manager over the inline menu items (flat app rows and other-site rows). */
    protected keyManager: FocusKeyManager<KbqDropdownItem>;

    /** @docs-private */
    private readonly menuItems = new QueryList<KbqDropdownItem>();

    /** @docs-private */
    private readonly dir = inject(Directionality, { optional: true });

    /**
     * CSS class marking a nested alias row, bound in the template (see app-switcher.html). Kept as a
     * single named constant, rather than a literal repeated in both places, so handleGroupHorizontal's
     * classList check can't silently drift from the template's class binding if the class is renamed.
     */
    protected readonly nestedAliasClass = 'kbq-app-switcher-site_nested';

    constructor() {
        super();

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!this.localeService) {
            this.initDefaultParams();
        }
    }

    ngAfterViewInit() {
        const input = this.input();

        this.keyManager = new FocusKeyManager<KbqDropdownItem>(this.menuItems)
            .withVerticalOrientation()
            .withHomeAndEnd()
            .withTypeAhead();

        // Focus the first item only once, and only after it is actually rendered (see below).
        let initialItemFocused = false;

        // Build the roving menu from the inline (static-content) items: the flat app rows, expanded
        // aliases and search results (`KbqAppSwitcherListItem`) plus the other-site rows
        // (`KbqAppSwitcherDropdownSite`). The apps inside the site flyouts (`KbqAppSwitcherDropdownApp`)
        // live in their own overlay dropdowns, which drive their own key manager, so they are excluded.
        this.allItems.changes.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.menuItems.reset(
                this.allItems.filter(
                    (item) => item instanceof KbqAppSwitcherListItem || item instanceof KbqAppSwitcherDropdownSite
                )
            );
            this.menuItems.notifyOnChanges();

            // When there is no search field, focus the first item on open. The static-content rows live
            // inside a `kbq-dropdown` that only materialises after this component's `ngAfterViewInit`, so
            // focusing eagerly there races the render and silently no-ops in production builds — wait for
            // the items to appear in the query instead.
            if (!input && !initialItemFocused && this.menuItems.length) {
                initialItemFocused = true;
                this.keyManager.setFirstItemActive();
            }
        });

        if (input) {
            input.focus();
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

        this.searchControl.valueChanges.subscribe((value) => {
            this.filteredSites = this.filterSites(value);
            // Switching between the flat list and the search results swaps the rendered items;
            // drop any stale active item so navigation restarts from the top.
            this.keyManager?.setActiveItem(-1);
        });
    }

    /** Releases the internal roving-focus menu QueryList. */
    ngOnDestroy(): void {
        this.menuItems.destroy();

        super.ngOnDestroy();
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

    /** Handles keyboard navigation across the app-switcher menu items.
     * @docs-private */
    protected keydownHandler(event: KeyboardEvent): void {
        const keyCode = event.keyCode;

        if (keyCode === ESCAPE) {
            this.escapeHandler();

            return;
        }

        // Keep the search field's native typing/caret behaviour; only ArrowDown moves into the list.
        if (this.eventFromInput(event)) {
            if (keyCode === DOWN_ARROW) {
                event.preventDefault();
                this.keyManager.setFocusOrigin('keyboard').setFirstItemActive();
            }

            return;
        }

        // Any key past this point is a keyboard interaction on a menu item, so show the focus ring.
        this.keyManager.setFocusOrigin('keyboard');

        const activeItem = this.keyManager.activeItem;

        if ((keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) && this.handleGroupHorizontal(keyCode, activeItem)) {
            event.preventDefault();

            return;
        }

        if ((keyCode === ENTER || keyCode === SPACE) && activeItem && !this.keyManager.isTyping()) {
            event.preventDefault();

            // A group header toggles its aliases; any other item activates its underlying link.
            if (activeItem instanceof KbqAppSwitcherListItem && activeItem.toggle()) {
                activeItem.collapsed = !activeItem.collapsed;
                this.markForCheck();
            } else {
                activeItem.getHostElement().click();
            }

            return;
        }

        // ArrowUp on the first item returns focus to the search field (no wrap-around).
        if (keyCode === UP_ARROW && this.keyManager.activeItemIndex === 0 && this.input()) {
            event.preventDefault();
            this.keyManager.setActiveItem(-1);
            this.input()!.focus();

            return;
        }

        this.keyManager.onKeydown(event);
    }

    /**
     * Expands/collapses an app group (or steps from an alias back to its header) on Left/Right,
     * honouring the current text direction. Returns whether the key was consumed.
     */
    private handleGroupHorizontal(keyCode: number, activeItem: KbqDropdownItem | null): boolean {
        if (!(activeItem instanceof KbqAppSwitcherListItem)) {
            return false;
        }

        const rtl = this.dir?.value === 'rtl';
        const expandKey = rtl ? LEFT_ARROW : RIGHT_ARROW;
        const collapseKey = rtl ? RIGHT_ARROW : LEFT_ARROW;

        if (activeItem.toggle()) {
            if (keyCode === expandKey && activeItem.collapsed) {
                activeItem.collapsed = false;
                this.markForCheck();

                return true;
            }

            if (keyCode === collapseKey && !activeItem.collapsed) {
                activeItem.collapsed = true;
                this.markForCheck();

                return true;
            }

            return false;
        }

        // Collapse key on a nested alias row moves focus back to its parent group header.
        if (keyCode === collapseKey && activeItem.getHostElement().classList.contains(this.nestedAliasClass)) {
            const items = this.menuItems.toArray();

            for (let index = this.keyManager.activeItemIndex - 1; index >= 0; index--) {
                const candidate = items[index];

                if (candidate instanceof KbqAppSwitcherListItem && candidate.toggle()) {
                    this.keyManager.setActiveItem(index);

                    return true;
                }
            }
        }

        return false;
    }

    /** Whether the keyboard event originated from the search input. */
    private eventFromInput(event: KeyboardEvent): boolean {
        return !!(event.target as HTMLElement)?.attributes.getNamedItem('kbqinput');
    }

    /** Syncs the key manager's active item with focus that arrives via Tab, click or a closing flyout.
     * Clears the active item (index -1) when focus lands on a focusable element that isn't one of
     * `menuItems` (e.g. the search field's clear button) - otherwise a stale `activeItem` from before
     * the focus move would keep receiving Enter/Space/arrow-key actions meant for the new target.
     * @docs-private */
    protected focusinHandler(event: FocusEvent): void {
        if (!this.keyManager) return;

        const index = this.menuItems.toArray().findIndex((item) => item.getHostElement() === event.target);

        this.keyManager.updateActiveItem(index);
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
    host: {
        '[class.kbq-app-switcher_open]': 'isOpen',
        '[class.kbq-active]': 'hasClickTrigger && isOpen',
        '(keydown)': 'keydownHandler($event)',
        '(touchend)': 'touchendHandler()'
    },
    exportAs: 'kbqAppSwitcher'
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
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input() selectedApp: KbqAppSwitcherApp;

    /** Placement of popUp */
    // TODO: Skipped for migration because:
    //  This input overrides a field from a superclass, while the superclass field
    //  is not migrated.
    @Input('kbqAppSwitcherPlacement') placement: KbqPopUpPlacementValues = PopUpPlacements.BottomLeft;

    /** Class that will be used in the background */
    // TODO: Skipped for migration because:
    //  Class of this input is referenced in the signature of another class.
    @Input() backdropClass: string = 'cdk-overlay-transparent-backdrop';

    /** Offset of popUp */
    // TODO: Skipped for migration because:
    //  Class of this input is referenced in the signature of another class.
    @Input({ transform: numberAttribute }) offset: number | null = defaultOffsetYWithArrow;

    /** Array of sites */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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

    /** @docs-private */
    get hasClickTrigger(): boolean {
        return this.trigger.includes(PopUpTriggers.Click);
    }

    /** Emits a change event whenever the placement state changes. */
    @Output('kbqPlacementChange') readonly placementChange = new EventEmitter();

    /** Emits a change event whenever the visible state changes. */
    @Output('kbqVisibleChange') readonly visibleChange = new EventEmitter<boolean>();

    /** @docs-private */
    readonly selectedSiteChange = output<KbqAppSwitcherSite>();
    /** @docs-private */
    readonly selectedAppChange = output<KbqAppSwitcherApp>();

    /** @docs-private */
    trigger: string = `${PopUpTriggers.Click}, ${PopUpTriggers.Keydown}`;

    /** @docs-private */
    originalSites: KbqAppSwitcherSite[];

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
                // eslint-disable-next-line rxjs-x/no-nested-subscribe
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

        if (!(
            rect.bottom >= containerRect.top &&
            rect.right >= containerRect.left &&
            rect.top <= containerRect.bottom &&
            rect.left <= containerRect.right
        )) {
            this.hide();
        }
    };
}

import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { CdkScrollable, Overlay, OverlayConfig, ScrollStrategy } from '@angular/cdk/overlay';

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
    Provider,
    QueryList,
    TemplateRef,
    Type,
    ViewChildren,
    ViewEncapsulation,
    booleanAttribute,
    computed,
    inject,
    model,
    numberAttribute,
    signal,
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
    KbqAppSwitcherLocaleConfiguration,
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
    TAB,
    UP_ARROW,
    applyPopupMargins,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdown, KbqDropdownItem, KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqInputModule } from '@koobiq/components/input';
import { defaultOffsetYWithArrow } from '@koobiq/components/popover';
import { KbqScrollbar } from '@koobiq/components/scrollbar';
import { merge } from 'rxjs';
import { auditTime, distinctUntilChanged, filter, startWith } from 'rxjs/operators';
import { kbqAppSwitcherAnimations } from './app-switcher-animations';
import { KbqAppSwitcherDropdownApp } from './app-switcher-dropdown-app';
import { KbqAppSwitcherDropdownSite } from './app-switcher-dropdown-site';
import { KbqAppSwitcherListItem } from './app-switcher-list-item';

export interface KbqAppSwitcherApp {
    name: string;
    id: string | number;
    type?: string | number;
    /**
     * Inline SVG markup for the application icon. Use this for SVG icons that should be rendered directly in
     * the DOM.
     *
     * The markup is sanitized against a strict SVG allow-list before it is rendered
     * (see `KbqAppSwitcherIconSanitizer`): scripts, event handlers, `foreignObject`, `style` and external
     * references are removed. Prefer `iconSrc` when the icon comes from a URL.
     */
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
    /**
     * Inline SVG markup for the site icon. Use this for SVG icons that should be rendered directly in the DOM.
     * Sanitized the same way as `KbqAppSwitcherApp.icon`.
     */
    icon?: string;
    /** Path to the icon file (URL or relative path). */
    iconSrc?: string;
    apps: KbqAppSwitcherApp[];
}

/**
 * Reducer that assigns an application to a group. Called once per application; implementations either push the
 * app into `untyped` (rendered as a plain row) or add it to a synthetic group in `groups`.
 */
export type KbqAppSwitcherGroupBy = (
    app: KbqAppSwitcherApp,
    groups: Record<string, KbqAppSwitcherApp>,
    untyped: KbqAppSwitcherApp[]
) => void;

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
                // The type name, not an empty string: the rendered rows are tracked by `id`, and a falsy one
                // would make every group fall back to the name-based key.
                id: appType
            };
        }
    }
}

/**
 * Runs `groupBy` over `apps` and returns the rendered order: synthetic groups big enough to be collapsible
 * first, then every remaining application as a plain row.
 *
 * A group is kept only when it holds strictly more than `minAppsForGrouping` applications; smaller groups are
 * flattened back into plain rows.
 */
export function makeGroupsForApps(
    apps: KbqAppSwitcherApp[],
    minAppsForGrouping: number,
    groupBy: KbqAppSwitcherGroupBy = defaultGroupBy
): KbqAppSwitcherApp[] {
    const groups: Record<string, KbqAppSwitcherApp> = {};
    const untyped: KbqAppSwitcherApp[] = [];
    const groupedApps: KbqAppSwitcherApp[] = [];

    apps.forEach((app) => groupBy(app, groups, untyped));

    Object.values(groups).forEach((group) => {
        const { aliases } = group;

        if (!aliases?.length) {
            // A custom `groupBy` is free to emit a group without aliases - render it as a plain row. An empty
            // array has to be dropped too: the template gates the group header on the presence of `aliases`,
            // and `[]` is truthy, so it would render a toggle that expands to nothing.
            untyped.push(aliases ? { ...group, aliases: undefined } : group);
        } else if (aliases.length > minAppsForGrouping) {
            groupedApps.push(group);
        } else {
            untyped.push(...aliases);
        }
    });

    groupedApps.push(...untyped);

    return groupedApps;
}

export const KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_SEARCH: number = 7;
export const KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_GROUPING: number = 3;

/**
 * `hideIfNotInViewPort` reads layout (`getBoundingClientRect`) and hangs off `CdkScrollable.elementScrolled()`,
 * which - unlike `ScrollDispatcher.scrolled()` - is not audited by the CDK; coalesce it to roughly one frame.
 */
const SCROLL_GEOMETRY_THROTTLE = 16;

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
export const KBQ_APP_SWITCHER_DEFAULT_CONFIGURATION: KbqAppSwitcherLocaleConfiguration = ruRULocaleData.appSwitcher;

/** Injection Token for providing configuration of app-switcher */
/** @docs-private */
export const KBQ_APP_SWITCHER_CONFIGURATION = new InjectionToken<KbqAppSwitcherLocaleConfiguration>(
    'KbqAppSwitcherConfiguration'
);

/**
 * Providers used by the app-switcher. `KbqAppSwitcherModule` applies them for `NgModule` consumers;
 * standalone consumers that import `KbqAppSwitcherTrigger` directly may add them to their application (or
 * route) providers.
 *
 * Providing them is optional: the only entry is the scroll strategy, and the directive falls back to the
 * default repositioning strategy when the token is absent. The app-switcher renders no focus trap, so - unlike
 * `KbqPopoverModule` and `KbqNotificationCenterModule`, whose templates bind `[cdkTrapFocus]` - it must not
 * swap `FOCUS_TRAP_INERT_STRATEGY`/`FocusTrapFactory`: those are injector-wide and would disable the CDK
 * inert strategy for every other focus trap in the same scope.
 */
export function kbqAppSwitcherProvider(): Provider[] {
    return [KBQ_APP_SWITCHER_SCROLL_STRATEGY_FACTORY_PROVIDER];
}

/**
 * Popup rendered by `KbqAppSwitcherTrigger`. The trigger attaches it to a CDK overlay itself (see
 * `getOverlayHandleComponentType`) and assigns `trigger` on the created instance, so consumers never place
 * `<kbq-app-switcher>` in a template - `[kbqAppSwitcher]` on the trigger element is the whole public surface.
 */
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
        KbqScrollbar,
        KbqOptionModule,
        KbqAppSwitcherDropdownApp,
        KbqAppSwitcherDropdownSite,
        KbqAppSwitcherListItem
    ],
    templateUrl: './app-switcher.html',
    styleUrls: ['./app-switcher.scss', './app-switcher-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-app-switcher',
        '(keydown)': 'keydownHandler($event)',
        '(focusin)': 'focusinHandler($event)',
        '(focusout)': 'focusoutHandler($event)'
    },
    animations: [kbqAppSwitcherAnimations.state],
    preserveWhitespaces: false
})
export class KbqAppSwitcherComponent extends KbqPopUp implements AfterViewInit, OnDestroy {
    /** @docs-private */
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });

    /** Configuration provided through `KBQ_APP_SWITCHER_CONFIGURATION`, overriding the locale strings. */
    readonly externalConfiguration = inject(KBQ_APP_SWITCHER_CONFIGURATION, { optional: true });

    /** Strings currently rendered by the popup. */
    configuration: KbqAppSwitcherLocaleConfiguration = KBQ_APP_SWITCHER_DEFAULT_CONFIGURATION;

    /** localized data
     * @docs-private */
    get localeData(): KbqAppSwitcherLocaleConfiguration {
        return this.configuration;
    }

    /** @docs-private */
    readonly searchControl = new FormControl('');

    /** @docs-private */
    filteredSites: KbqAppSwitcherSite[] = [];

    /** @docs-private */
    prefix = 'kbq-app-switcher';

    /** @docs-private */
    // TODO: Skipped for migration because:
    //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
    //  and migrating would break narrowing currently.
    @Input() trigger: KbqAppSwitcherTrigger;

    /** @docs-private */
    protected activeSite: KbqAppSwitcherSite | undefined;
    /** @docs-private */
    protected activeApp: KbqAppSwitcherApp | undefined;

    /** @docs-private */
    readonly input = viewChild(KbqInput);

    /**
     * The other-sites flyout, closed whenever the pointer moves back over the main list.
     *
     * Not `required`: it only exists in multi-site mode, and reading a required query with no match throws -
     * which a single-site switcher with a search field would do on the first `mouseenter`.
     * @docs-private
     */
    readonly otherSites = viewChild<KbqDropdown>('otherSites');

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

        this.visibleChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((state) => {
            // Not memoized on `offset`: `applyPopupMargins` picks the margin side from the current
            // `kbq-app-switcher_placement-*` classes, so the write depends on the placement too.
            if (!state || this.offset === null) return;

            applyPopupMargins(this.renderer, this.elementRef.nativeElement, this.prefix, `${this.offset}px`);
        });

        this.searchControl.valueChanges
            .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => {
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
    escapeHandler() {
        this.hide(0);
    }

    /** Handles keyboard navigation across the app-switcher menu items.
     * @docs-private */
    protected keydownHandler(event: KeyboardEvent): void {
        const keyCode = event.keyCode;

        if (keyCode === ESCAPE) {
            // Stop here so Escape closes only this popup instead of bubbling into overlays opened
            // earlier (mirrors KbqDropdown.handleKeydown).
            event.preventDefault();
            event.stopPropagation();
            this.escapeHandler();

            return;
        }

        // The host `(keydown)` binding is live before `ngAfterViewInit` builds the key manager; until
        // then there is nothing to navigate, so ignore the key (mirrors `focusinHandler`).
        if (!this.keyManager) {
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

        // Tab leaves the menu (WAI-ARIA menu pattern): close and move focus to the trigger ourselves.
        // Preventing the default stops the browser from first shifting focus into its own chrome, which
        // would leave the real focus out of sync with the ring shown on the trigger.
        if (keyCode === TAB) {
            event.preventDefault();
            this.hide(0);
            this.trigger.focus();

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
                activeItem.collapsed.set(!activeItem.collapsed());
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
            if (keyCode === expandKey && activeItem.collapsed()) {
                activeItem.collapsed.set(false);
                this.markForCheck();

                return true;
            }

            if (keyCode === collapseKey && !activeItem.collapsed()) {
                activeItem.collapsed.set(true);
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

    /** Closes the popup once focus leaves the menu and its site flyouts, mirroring the dropdown.
     * @docs-private */
    protected focusoutHandler(event: FocusEvent): void {
        const next = event.relatedTarget as HTMLElement | null;

        // Keep open while focus stays inside the popup or moves into a site flyout overlay
        // (flyouts are separate overlays whose panes carry the `.kbq-app-switcher-sites` class).
        if (!next || !next.closest('.kbq-app-switcher, .kbq-app-switcher-sites')) {
            this.hide(0);
            // Return focus to the trigger (the same landing spot as Shift+Tab), instead of
            // leaving it wherever it was heading.
            this.trigger.focus();
        }
    }

    /** Selects an application belonging to one of the other sites.
     * @docs-private */
    selectAppInSite(site: KbqAppSwitcherSite | undefined, app: KbqAppSwitcherApp) {
        if (!site) return;

        this.trigger.selectedSite.set(site);
        this.trigger.selectedApp.set(app);
    }

    /** Drops the flyout content once its dropdown closes, so a reopened panel never shows the previous site.
     * @docs-private */
    protected resetActiveSite(): void {
        this.activeSite = undefined;
    }

    /** The same for the nested group of a flyout app.
     * @docs-private */
    protected resetActiveApp(): void {
        this.activeApp = undefined;
    }

    private filterSites(query: string | null): KbqAppSwitcherSite[] {
        const sites = this.trigger.originalSites;

        if (!query) return sites;

        const search = query.toLowerCase();
        const matches = (app: KbqAppSwitcherApp): boolean =>
            app.name.toLowerCase().includes(search) || !!app.caption?.toLowerCase().includes(search);

        // Shallow copies only: a `structuredClone` of every site would be an O(all apps) deep copy per
        // keystroke, and would also hand `@for` brand-new app objects to re-render on every character.
        return sites
            .map((site) => ({ ...site, apps: site.apps.filter(matches) }))
            .filter((site) => site.apps.length > 0);
    }

    private updateLocaleParams = () => {
        this.configuration =
            this.externalConfiguration ??
            this.localeService?.getParams('appSwitcher') ??
            KBQ_APP_SWITCHER_DEFAULT_CONFIGURATION;

        this.changeDetectorRef.markForCheck();
    };

    private initDefaultParams() {
        this.configuration = this.externalConfiguration || KBQ_APP_SWITCHER_DEFAULT_CONFIGURATION;
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
    /**
     * Optional so a standalone consumer works without `kbqAppSwitcherProvider()`; an application-level
     * provider for `KBQ_APP_SWITCHER_SCROLL_STRATEGY` still wins over this fallback.
     * @docs-private
     */
    protected scrollStrategy: () => ScrollStrategy =
        inject(KBQ_APP_SWITCHER_SCROLL_STRATEGY, { optional: true }) ??
        kbqAppSwitcherScrollStrategyFactory(this.overlay);

    // Abstract members of `KbqPopUp`/`KbqPopUpTrigger` that the app-switcher has no use for: its content is
    // fixed (the app list), it never draws an arrow and it never renders a backdrop.
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

    /** Whether search is used or not */
    get withSearch(): boolean {
        return this.appsCount > KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_SEARCH;
    }

    /** Number of applications to choose from
     * @docs-private */
    get appsCount(): number {
        return this.appsCountComputed();
    }

    /** Whether the sites are used or not
     * @docs-private */
    get sitesMode(): boolean {
        return this.sitesModeComputed();
    }

    /** Applications of the currently selected site, grouped for rendering.
     * @docs-private */
    get currentApps(): KbqAppSwitcherApp[] {
        return this.currentAppsComputed();
    }

    /** Selected application */
    readonly selectedApp = model<KbqAppSwitcherApp | undefined>(undefined);

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

    /** Array of sites, with the applications of each site grouped for rendering. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get sites(): KbqAppSwitcherSite[] {
        return this.parsedSites();
    }

    set sites(value: KbqAppSwitcherSite[]) {
        this.originalSites = value;
    }

    /** Function to group the apps by type. The first argument is an app object with type.
     * The second is a groups object and third is an array for untyped apps */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get groupBy(): KbqAppSwitcherGroupBy {
        return this.groupBySignal();
    }

    set groupBy(fn: KbqAppSwitcherGroupBy) {
        this.groupBySignal.set(fn);
    }

    /** Selected site */
    readonly selectedSite = model<KbqAppSwitcherSite | undefined>(undefined);

    /**
     * `selectedSite` with its applications grouped for rendering.
     *
     * Looked up by id among the parsed sites, so re-selecting a site never regroups it again. Falls back to
     * the raw value when the id is unknown (a stale id, or `selectedSite` set before `sites`) instead of
     * throwing.
     * @docs-private
     */
    readonly parsedSelectedSite = computed<KbqAppSwitcherSite | undefined>(() => {
        const value = this.selectedSite();

        return value && (this.parsedSitesById().get(value.id) ?? value);
    });

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

    /**
     * Space-separated list of DOM events that open the popup (`KbqPopUpTrigger.trigger`).
     *
     * Not to be confused with `KbqAppSwitcherComponent.trigger`, which is the back-reference from the popup to
     * this directive.
     * @docs-private
     */
    trigger: string = `${PopUpTriggers.Click}, ${PopUpTriggers.Keydown}`;

    /** Sites exactly as supplied through `sites`, without grouping.
     * @docs-private */
    get originalSites(): KbqAppSwitcherSite[] {
        return this.originalSitesSignal();
    }

    set originalSites(value: KbqAppSwitcherSite[]) {
        this.originalSitesSignal.set(value ?? []);
    }

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

    private readonly originalSitesSignal = signal<KbqAppSwitcherSite[]>([]);
    private readonly groupBySignal = signal<KbqAppSwitcherGroupBy>(defaultGroupBy);

    /**
     * Sites with their applications grouped, keyed by site id.
     *
     * Grouping runs once per `sites`/`groupBy` change instead of once per `selectedSite` assignment, and the
     * parsed objects keep their identity so `@for` can reuse the rendered rows.
     */
    private readonly parsedSitesById = computed(() => {
        const groupBy = this.groupBySignal();

        return new Map(
            this.originalSitesSignal().map((site) => [
                site.id,
                {
                    ...site,
                    apps: makeGroupsForApps(site.apps, KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_GROUPING, groupBy)
                } satisfies KbqAppSwitcherSite
            ])
        );
    });

    private readonly parsedSites = computed(() => [...this.parsedSitesById().values()]);

    private readonly appsCountComputed = computed(() =>
        this.originalSitesSignal().reduce((acc, site) => acc + site.apps.length, 0)
    );

    private readonly sitesModeComputed = computed(() => this.originalSitesSignal().length > 1);

    private readonly currentAppsComputed = computed(() =>
        this.sitesModeComputed()
            ? // A multi-site switcher can be opened before a site is selected; render nothing rather than crash.
              (this.parsedSelectedSite()?.apps ?? [])
            : (this.parsedSites()[0]?.apps ?? [])
    );

    ngOnInit(): void {
        super.ngOnInit();

        this.scrollable
            ?.elementScrolled()
            .pipe(auditTime(SCROLL_GEOMETRY_THROTTLE), takeUntilDestroyed(this.destroyRef))
            .subscribe(this.hideIfNotInViewPort);
    }

    ngAfterContentInit(): void {
        // Hide the popup once it scrolls out of an ancestor that opted in with `kbq-hide-nested-popup`
        // (e.g. a tab body), mirroring `KbqPopover`. No extra throttle: `ScrollDispatcher.scrolled()`
        // already audits its output (20ms by default).
        this.scrollDispatcher
            .scrolled()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((scrollable: CdkScrollable | void) => {
                if (!scrollable?.getElementRef().nativeElement.classList.contains('kbq-hide-nested-popup')) return;

                const parentRects = scrollable.getElementRef().nativeElement.getBoundingClientRect();
                const childRects = this.elementRef.nativeElement.getBoundingClientRect();

                if (childRects.bottom < parentRects.top || childRects.top > parentRects.bottom) {
                    this.hide();
                }
            });

        // On close, return focus to the trigger. Inner-scroll close suppression lives in
        // `closingActions()` (it filters scrolls originating inside the popup), so no per-visibility
        // subscription is needed here.
        this.visibleChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((visible: boolean) => {
            if (!visible) {
                this.focus();
            }
        });
    }

    /** @docs-private */
    updateData() {
        if (!this.instance) return;

        this.instance.content = this.content;
        this.instance.arrow = this.arrow;
        this.instance.offset = this.offset;

        if (this.isOpen) {
            this.updatePosition(true);
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
            // Only an outer/ancestor scroll that moves the popup out of view should close it. Scrolling
            // the popup's own content must not: its `KbqScrollbar` viewport is a `CdkScrollable`, so it
            // reaches the root `ScrollDispatcher`, and keyboard navigation scrolls the focused item into
            // view through that viewport - without this filter every arrow key would close the panel.
            this.scrollDispatcher.scrolled().pipe(filter((scrollable) => !this.isInnerScroll(scrollable)))
        );
    }

    /** Whether a `ScrollDispatcher` emission originates from inside this popup's own scrollable content. */
    private isInnerScroll(scrollable: CdkScrollable | void): boolean {
        return (
            scrollable instanceof CdkScrollable &&
            !!scrollable.getElementRef().nativeElement.closest('.kbq-app-switcher, .kbq-app-switcher-sites')
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

import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform } from '@angular/cdk/platform';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import {
    AfterContentChecked,
    AfterContentInit,
    afterNextRender,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    contentChildren,
    DestroyRef,
    Directive,
    ElementRef,
    forwardRef,
    inject,
    InjectionToken,
    input,
    isDevMode,
    OnChanges,
    OnDestroy,
    output,
    QueryList,
    signal,
    SimpleChanges,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    KBQ_PARENT_ANIMATION_COMPONENT,
    kbqOptionalNumberAttribute,
    kbqQueryListFrom,
    KbqStateSaving
} from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { merge, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { KbqTabBody } from './tab-body.component';
import { KbqTabHeader } from './tab-header.component';
import { KbqTabLabelWrapper } from './tab-label-wrapper.directive';
import { KbqTab } from './tab.component';

@Directive({
    selector:
        'kbq-tab-group[kbq-align-tabs-center], [kbq-tab-nav-bar][kbq-align-tabs-center], [kbqTabNavBar][kbq-align-tabs-center]',
    host: { class: 'kbq-tab-group_align-labels-center' }
})
export class KbqAlignTabsCenterCssStyler {}

@Directive({
    selector:
        'kbq-tab-group[kbq-align-tabs-end], [kbq-tab-nav-bar][kbq-align-tabs-end], [kbqTabNavBar][kbq-align-tabs-end]',
    host: { class: 'kbq-tab-group_align-labels-end' }
})
export class KbqAlignTabsEndCssStyler {}

@Directive({
    selector: 'kbq-tab-group[kbq-stretch-tabs], [kbq-tab-nav-bar][kbq-stretch-tabs], [kbqTabNavBar][kbq-stretch-tabs]',
    host: { class: 'kbq-tab-group_stretch-labels' }
})
export class KbqStretchTabsCssStyler {}

/**
 * @deprecated No-op. The vertical layout class is bound from `KbqTabGroup`/`KbqTabNavBar` themselves,
 *  so it follows the `vertical` value instead of merely the presence of the attribute. Will be removed
 *  in a future major version — stop importing it.
 */
@Directive({
    selector: 'kbq-tab-group[vertical], [kbq-tab-nav-bar][vertical], [kbqTabNavBar][vertical]'
})
export class KbqVerticalTabsCssStyler {}

/** Used to generate unique ID's for each tab component */
let nextId = 0;

/** Debounce applied to header resizes before the tab labels are re-measured for overflow. */
const RESIZE_DEBOUNCE_INTERVAL = 100;

/** A simple change event emitted on focus or selection changes. */
export class KbqTabChangeEvent {
    /** Index of the currently-selected tab. */
    index!: number;
    /** Reference to the currently-selected tab. */
    tab!: KbqTab;
}

/** Possible positions for the tab header. */
export type KbqTabHeaderPosition = 'above' | 'below';

/** Object that can be used to configure the default options for the tabs module. */
export interface KbqTabsConfig {
    /** Duration for the tab animation. Must be a valid CSS value (e.g. 600ms). */
    animationDuration?: string;
}

/** Injection token that can be used to provide the default options the tabs module. */
export const KBQ_TABS_CONFIG = new InjectionToken<KbqTabsConfig>('KBQ_TABS_CONFIG');

export type KbqTabSelectBy = string | number | ((tabs: KbqTab[]) => KbqTab | null);

/**
 * The persisted state of a tab group — which tab was selected.
 *
 * Both are stored: `tabId` is the only identifier that survives a reordering, and `index` is all there is
 * when the tabs carry no `tabId`.
 */
export interface KbqTabsState {
    tabId: string | null;
    index: number;
}

/**
 * Coerces a raw persisted payload into a `KbqTabsState`, returning `null` for anything unrecognizable.
 *
 * Web storage is origin-wide and user-writable, so a payload is never trusted — without this, an entry
 * such as `{"index": "first"}` would reach `clampTabIndex` and select nothing.
 */
const normalizeTabsState = (parsed: unknown): KbqTabsState | null => {
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    const { tabId, index } = parsed as Partial<KbqTabsState>;

    if (typeof index !== 'number' || !Number.isInteger(index) || index < 0) return null;

    return { tabId: typeof tabId === 'string' ? tabId : null, index };
};

/**
 * Tab-group component.  Supports basic tab pairs (label + content) and includes keyboard navigation.
 */
@Component({
    selector: 'kbq-tab-group',
    imports: [KbqTabHeader, CdkMonitorFocus, KbqTabLabelWrapper, KbqTooltipTrigger, CdkPortalOutlet, KbqTabBody],
    templateUrl: './tab-group.html',
    styleUrls: ['./tab-group.scss', './tabs-tokens.scss'],
    providers: [{ provide: KBQ_PARENT_ANIMATION_COMPONENT, useExisting: forwardRef(() => KbqTabGroup) }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-tab-group',
        '[class.kbq-tab-group_filled]': '!transparent()',
        '[class.kbq-tab-group_transparent]': 'transparent()',
        '[class.kbq-tab-group_on-background]': '!onSurface()',
        '[class.kbq-tab-group_on-surface]': 'onSurface()',
        '[class.kbq-tab-group_dynamic-height]': 'dynamicHeight()',
        '[class.kbq-tab-group_vertical]': 'vertical()',
        '[class.kbq-tab-group_inverted-header]': 'headerPosition === "below"'
    },
    // `useStateSaving` and `stateSavingKey` are the directive's inputs, surfaced on the tab group.
    hostDirectives: [
        { directive: KbqStateSaving, inputs: ['useStateSaving', 'stateSavingKey'] }
    ],
    exportAs: 'kbqTabGroup'
})
export class KbqTabGroup implements OnChanges, AfterContentInit, AfterViewInit, AfterContentChecked, OnDestroy {
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly destroyRef = inject(DestroyRef);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly platform = inject(Platform);

    /**
     * Persistence of the selected tab, applied as a host directive. `useStateSaving` and `stateSavingKey`
     * are its inputs, forwarded onto the tab group.
     */
    private readonly stateSaving = inject(KbqStateSaving);

    private readonly tabsQuery = contentChildren(KbqTab);
    private readonly tabsList = kbqQueryListFrom(this.tabsQuery);

    /** The tabs of the group. */
    get tabs(): QueryList<KbqTab> {
        return this.tabsList();
    }

    readonly tabBodyWrapper = viewChild.required<ElementRef>('tabBodyWrapper');

    readonly tabHeader = viewChild.required<KbqTabHeader>('tabHeader');

    /** Whether the tab strip background should be transparent. */
    readonly transparent = input<boolean, unknown>(false, { transform: booleanAttribute });

    /** Whether the group is rendered on a surface rather than on the page background. */
    readonly onSurface = input<boolean, unknown>(false, { transform: booleanAttribute });

    /** Whether the selected tab is marked with an underline instead of a filled background. */
    readonly underlined = input<boolean, unknown>(false, { transform: booleanAttribute });

    /** Whether the tab strip is laid out vertically, alongside the content instead of above it. */
    readonly vertical = input<boolean, unknown>(false, { transform: booleanAttribute });

    /** Whether the tab group should grow to the size of the active tab. */
    readonly dynamicHeight = input<boolean, unknown>(false, { transform: booleanAttribute });

    /** @docs-private */
    readonly selectedIndexInput = input<number | undefined, number | string | null | undefined>(undefined, {
        alias: 'selectedIndex',
        transform: kbqOptionalNumberAttribute
    });

    /** @docs-private */
    readonly activeTabInput = input<KbqTabSelectBy | null | undefined>(undefined, { alias: 'activeTab' });

    /** @docs-private */
    readonly headerPositionInput = input<KbqTabHeaderPosition | undefined>(undefined, { alias: 'headerPosition' });

    /** @docs-private */
    readonly animationDurationInput = input<string | undefined>(undefined, { alias: 'animationDuration' });

    /** The index of the active tab. */
    get selectedIndex(): number {
        return this.selectedIndexState()!;
    }

    set selectedIndex(value: number) {
        this.activeTab = value;
    }

    private readonly selectedIndexState = signal<number | undefined>(undefined);

    get activeTab(): KbqTab | null {
        switch (typeof this.attributeToSelectBy) {
            case 'number':
                return this.tabs.get(this.clampTabIndex(this.attributeToSelectBy)) || null;
            case 'string':
                return (
                    this.tabs.toArray().find(({ tabId: tabIdInput }) => {
                        const tabId = tabIdInput();

                        return tabId === this.attributeToSelectBy;
                    }) ||
                    this.tabs.get(0) ||
                    null
                );
            case 'function':
                return this.attributeToSelectBy(this.tabs.toArray());
            default:
                return this.getDefaultTab();
        }
    }

    set activeTab(value: KbqTabSelectBy | null) {
        // `selectedIndex` assigns through here too, so this one flag covers both inputs.
        this.attributeWritten = true;

        this.attributeToSelectBy = value;
    }

    /** Position of the tab header. */
    headerPosition: KbqTabHeaderPosition = 'above';

    /** Duration for the tab animation. Must be a valid CSS value (e.g. 600ms). */
    animationDuration: string;

    /** Output to enable support for two-way binding on `[(selectedIndex)]` */
    readonly selectedIndexChange = output<number>();

    /** Event emitted when the tab selection has changed. */
    readonly activeTabChange = output<string | number | KbqTab>();

    /** Event emitted when focus has changed within a tab group. */
    readonly focusChange = output<KbqTabChangeEvent>();

    /** Event emitted when the body animation has completed */
    readonly animationDone = output<void>();

    /** Event emitted when the tab selection has changed. */
    readonly selectedTabChange = output<KbqTabChangeEvent>();

    private attributeToSelectBy: KbqTabSelectBy | null = null;

    /**
     * Whether anything has assigned `activeTab` or `selectedIndex`. Snapshotted while initializing, where
     * only an input binding can have done so, and read from then on as "the application drives the
     * selection" — which suppresses persistence.
     */
    private attributeWritten = false;

    private controlled = false;

    /** Whether the dev-mode warning about a tab with no `tabId` has already been logged. */
    private warnedAboutTabId = false;

    /** Snapshot of the height of the tab body wrapper before another tab is activated. */
    private tabBodyWrapperHeight = 0;

    /** Subscription to tabs being added/removed. */
    private tabsSubscription = Subscription.EMPTY;

    /** Subscription to changes in the tab labels. */
    private tabLabelSubscription = Subscription.EMPTY;

    private readonly groupId: number;

    private readonly defaultAnimationDuration =
        inject<KbqTabsConfig>(KBQ_TABS_CONFIG, { optional: true })?.animationDuration || '0ms';

    constructor() {
        this.groupId = nextId++;
        this.animationDuration = this.defaultAnimationDuration;

        // The state lives under the new key now, so restore from it.
        this.stateSaving.keyChanges.subscribe(() => this.applySavedState());

        // `checkOverflow` writes `tab.overflowTooltipTitle`, which the same view reads through
        // `[kbqTooltipDisabled]`. Deferring it past the render keeps the write out of the checked cycle.
        afterNextRender(() => {
            this.checkOverflow();
            this.changeDetectorRef.markForCheck();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        // A bound input is handed to its member, except that `undefined` resets a member
        // typed without it to its default; unbound, it leaves what code wrote.
        // Assigned through `activeTab`, because the `selectedIndex` setter takes no `null` — the default, which selects
        // the first enabled tab.
        if (changes['selectedIndexInput']) this.activeTab = this.selectedIndexInput() ?? null;

        // A bound `undefined` is handed over too: binding `activeTab` at all lets the application drive the
        // selection, which turns the state saving off.
        if (changes['activeTabInput']) {
            this.activeTab = this.activeTabInput() ?? null;
        }

        if (changes['headerPositionInput']) {
            this.headerPosition = this.headerPositionInput() ?? 'above';
        }

        if (changes['animationDurationInput']) {
            this.animationDuration = this.animationDurationInput() ?? this.defaultAnimationDuration;
        }
    }

    ngAfterContentInit() {
        this.subscribeToTabLabels();

        this.restoreState();

        // Subscribe to changes in the amount of tabs, in order to be
        // able to re-render the content as new tabs are added or removed.
        this.tabsSubscription = this.tabs.changes.subscribe(() => {
            const indexToSelect = this.getTabIndexToSelect();

            // Maintain the previously-selected tab if a new tab is added or removed and there is no
            // explicit change that selects a different tab.
            if (indexToSelect === this.selectedIndexState()) {
                const tabs = this.tabs.toArray();

                for (let i = 0; i < tabs.length; i++) {
                    if (tabs[i].isActive) {
                        // Assign both to the `activeTab` and the selected index so we don't fire a changed
                        // event, otherwise the consumer may end up in an infinite loop in some edge cases like
                        // adding a tab within the `selectedIndexChange` event.
                        this.selectedIndexState.set(i);
                        this.onSelectFocusedIndex(i);
                        break;
                    }
                }
            }

            this.subscribeToTabLabels();
            // Also marks the ancestors, whose check runs `ngAfterContentChecked` and positions the tabs.
            this.changeDetectorRef.markForCheck();
        });
    }

    /**
     * After the content is checked, this component knows what tabs have been defined
     * and what the selected index should be. This is where we can know exactly what position
     * each tab should be in according to the new selected index, and additionally we know how
     * a new selected tab should transition in (from the left or right).
     */
    ngAfterContentChecked() {
        // Brings `tabs` up to date first, so that its `changes` subscribers, which keep the selected tab when tabs are
        // added or removed, run before the selection is computed.
        this.tabsList();

        // Don't clamp the `indexToSelect` immediately in the setter because it can happen that
        // the amount of tabs changes before the actual change detection runs.
        const indexToSelect = this.getTabIndexToSelect();

        // If there is a change in selected index, emit a change event. Should not trigger if
        // the selected index has not yet been initialized.
        if (this.selectedIndexState() !== indexToSelect) {
            const isFirstRun = this.selectedIndexState() == null;

            if (!isFirstRun) {
                this.selectedTabChange.emit(this.createChangeEvent(indexToSelect));
            }

            // Changing these values after change detection has run
            // since the checked content may contain references to them.
            Promise.resolve().then(() => {
                this.tabs.forEach((tab, index) => (tab.isActive = index === indexToSelect));

                if (!isFirstRun) {
                    const tabToSelect = this.activeTab;

                    this.selectedIndexChange.emit(indexToSelect);
                    this.activeTabChange.emit(
                        this.attributeToSelectBy && typeof this.attributeToSelectBy === 'function' && tabToSelect
                            ? tabToSelect
                            : (this.attributeToSelectBy as string | number)
                    );
                }
            });
        }

        const selectedIndex = this.selectedIndexState();

        // Setup the position for each tab and optionally setup an origin on the next selected tab.
        this.tabs.forEach((tab: KbqTab, index: number) => {
            tab.position = index - indexToSelect;

            // If there is already a selected tab, then set up an origin for the next selected tab
            // if it doesn't have one already.

            if (selectedIndex != null && tab.position === 0 && !tab.origin) {
                tab.origin = indexToSelect - selectedIndex;
            }
        });

        this.selectedIndexState.set(indexToSelect);
    }

    ngAfterViewInit(): void {
        if (!this.platform.isBrowser) return;

        // An element observer also catches container resizes, which no window resize event reports.
        this.resizeObserver
            .observe(this.tabHeader().elementRef.nativeElement)
            .pipe(debounceTime(RESIZE_DEBOUNCE_INTERVAL), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                // Read the current value: only vertical labels are truncated, and `vertical` can change.
                if (!this.vertical()) return;

                this.checkOverflow();
                this.changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy() {
        this.tabsSubscription.unsubscribe();
        this.tabLabelSubscription.unsubscribe();
    }

    focusChanged(index: number) {
        this.focusChange.emit(this.createChangeEvent(index));
    }

    /** Returns a unique id for each tab label element */
    getTabLabelId(i: number): string {
        return `kbq-tab-label-${this.groupId}-${i}`;
    }

    /** Returns a unique id for each tab content element */
    getTabContentId(i: number): string {
        return `kbq-tab-content-${this.groupId}-${i}`;
    }

    /**
     * Sets the height of the body wrapper to the height of the activating tab if dynamic
     * height property is true.
     */
    setTabBodyWrapperHeight(tabHeight: number): void {
        if (!this.dynamicHeight() || !this.tabBodyWrapperHeight) {
            return;
        }

        const wrapper: HTMLElement = this.tabBodyWrapper().nativeElement;

        wrapper.style.height = `${this.tabBodyWrapperHeight}px`;

        // This conditional forces the browser to paint the height so that
        // the animation to the new height can have an origin.
        if (this.tabBodyWrapper().nativeElement.offsetHeight) {
            wrapper.style.height = `${tabHeight}px`;
        }
    }

    /** Removes the height of the tab body wrapper. */
    removeTabBodyWrapperHeight(): void {
        this.tabBodyWrapperHeight = this.tabBodyWrapper().nativeElement.clientHeight;
        this.tabBodyWrapper().nativeElement.style.height = '';
        this.animationDone.emit();
    }

    /** Handle click events, setting new selected index if appropriate. */
    handleClick(tab: KbqTab, tabHeader: KbqTabHeader, index: number) {
        // Untracked, as `onSelectFocusedIndex()`, `saveState()` and `clearSavedState()`: called from a consumer's
        // `effect()`, the state read on the way — the tabs and their inputs, the selection, the state saving inputs —
        // would make the effect run again whenever it changes.
        untracked(() => {
            if (tab.disabled) {
                return;
            }

            this.onSelectFocusedIndex(index);
            tabHeader.focusIndex = index;
        });
    }

    /**
     * Retrieves the tabindex for the tab. The single `0` follows the header's focus position rather
     * than the selection, so that a disabled selected tab cannot take the whole strip out of the tab
     * order — a disabled tab is `-1`, never absent, so it stays a roving-tabindex participant.
     */
    getTabIndex(tab: KbqTab, tabHeader: KbqTabHeader, index: number): number {
        if (tab.disabled) {
            return -1;
        }

        return this.getRovingTabIndex(tabHeader) === index ? 0 : -1;
    }

    onSelectFocusedIndex($event: number): void {
        untracked(() => {
            if (typeof this.attributeToSelectBy === 'string') {
                this.activeTab = this.tabs.get($event)?.tabId() || null;
            } else {
                this.activeTab = $event;
            }

            this.saveState();
        });
    }

    /**
     * Persists which tab is selected.
     *
     * Called for every selection a user makes. Both the tab's `tabId` and its position are stored: the
     * `tabId` is the only one that survives the tabs being reordered, and the position is all there is
     * when the tabs carry none.
     */
    saveState(): void {
        untracked(() => {
            if (!this.persists) return;

            this.stateSaving.write(this.snapshot());
        });
    }

    /**
     * Removes the state persisted for this tab group.
     *
     * Persistence itself stays on — the next selection is written again. Unset `useStateSaving` to stop
     * it.
     */
    clearSavedState(): void {
        untracked(() => this.stateSaving.clear());
    }

    /**
     * Whether state is currently persisted for this tab group — restored on init, or written since.
     * Always `false` while `useStateSaving` is unset, and `false` again after `clearSavedState()`.
     */
    get hasSavedState(): boolean {
        return this.stateSaving.state != null;
    }

    /** Whether this tab group reads and writes its selection at all. */
    private get persists(): boolean {
        // A group that is not in the document has no stable key — the default resolver derives one from
        // the path to `<body>` — which is the ordinary state of one projected into an overlay.
        return this.stateSaving.useStateSaving() && !this.controlled && !!this.stateSaving.host?.isConnected;
    }

    /** Restores the persisted selection, unless the application drives it. */
    private restoreState(): void {
        // Only an input binding can have assigned by now: `activeTab` needs a view query to reach, and a
        // click needs a rendered header. Snapshotted here rather than in `applySavedState()`, which runs
        // again after a key change — by then a click has assigned too, and would read as an application.
        this.controlled = this.attributeWritten;

        this.applySavedState();
    }

    /** Reads the persisted selection and applies it. Runs while initializing, and again on a key change. */
    private applySavedState(): void {
        if (!this.persists) return;

        const savedState = this.stateSaving.read(normalizeTabsState);

        if (!savedState) return;

        const tabs = this.tabs.toArray();
        const byId = savedState.tabId === null ? -1 : tabs.findIndex((tab) => tab.tabId() === savedState.tabId);

        // The id wins wherever it still names a tab, so a reordering does not select the wrong one. Its
        // position is the fallback, and a payload naming neither is dropped rather than clamped — the
        // group then keeps whatever it would have selected on its own.
        if (byId < 0 && savedState.index >= tabs.length) return;

        this.stateSaving.applying(() => {
            this.activeTab = byId < 0 ? savedState.index : savedState.tabId;
        });
    }

    /** The whole selection, by id and by position. */
    private snapshot(): KbqTabsState {
        const tabs = this.tabs?.toArray() ?? [];
        const active = this.activeTab;
        const index = active ? tabs.indexOf(active) : -1;
        const tabId = active?.tabId() || null;

        if (!tabId && isDevMode() && !this.warnedAboutTabId) {
            this.warnedAboutTabId = true;

            // eslint-disable-next-line no-console
            console.warn(
                'kbq-tab-group: the selected tab has no `tabId`, so the selection is persisted by ' +
                    'position. A position survives a reload but not a reordering, and then restores the ' +
                    'wrong tab. Give the tabs a `tabId`, or unset `useStateSaving`.'
            );
        }

        return { tabId, index: index < 0 ? 0 : index };
    }

    private checkOverflow(): void {
        this.tabHeader().items.forEach((headerTab) => headerTab.checkOverflow());
    }

    private createChangeEvent(index: number): KbqTabChangeEvent {
        const event = new KbqTabChangeEvent();

        event.index = index;

        if (this.tabs && this.tabs.length) {
            event.tab = this.tabs.toArray()[index];
        }

        return event;
    }

    /**
     * Subscribes to changes in the tab labels. This is needed, because the `@Input` for the label is
     * on the KbqTab component, whereas the data binding is inside the KbqTabGroup. In order for the
     * binding to be updated, we need to subscribe to changes in it and trigger change detection
     * manually.
     */
    private subscribeToTabLabels() {
        if (this.tabLabelSubscription) {
            this.tabLabelSubscription.unsubscribe();
        }

        this.tabLabelSubscription = merge(...this.tabs.map((tab) => tab.stateChanges)).subscribe(() =>
            this.changeDetectorRef.markForCheck()
        );
    }

    /**
     * Index that owns `tabindex="0"`, falling back to the first enabled tab when focus sits on a
     * disabled one.
     *
     * The template calls this once per tab, so the common path stays allocation-free: `QueryList.get`
     * indexes the backing array, where `toArray()` would copy it N times per check.
     */
    private getRovingTabIndex(tabHeader: KbqTabHeader): number {
        const { focusIndex } = tabHeader;
        const focused = this.tabs.get(focusIndex);

        if (focused && !focused.disabled) {
            return focusIndex;
        }

        for (let index = 0; index < this.tabs.length; index++) {
            if (!this.tabs.get(index)!.disabled) {
                return index;
            }
        }

        return -1;
    }

    /** First tab that can actually be selected, so that a leading disabled tab is not the default. */
    private getDefaultTab(): KbqTab | null {
        return this.tabs.find((tab) => !tab.disabled) || this.tabs.get(0) || null;
    }

    /** Clamps the given index to the bounds of 0 and the tabs length. */
    private clampTabIndex(index: number | null): number {
        // Note the `|| 0`, which ensures that values like NaN can't get through
        // and which would otherwise throw the component into an infinite loop
        // (since Math.max(NaN, 0) === NaN).
        return Math.min(this.tabs.length - 1, Math.max(index || 0, 0));
    }

    private getTabIndexToSelect(): number {
        const currentSelectedTab = this.activeTab;

        if (currentSelectedTab === null) {
            return 0;
        }

        return this.tabs ? this.tabs.toArray().indexOf(currentSelectedTab) : 0;
    }
}

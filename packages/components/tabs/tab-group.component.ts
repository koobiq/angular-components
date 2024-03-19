import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import {
    AfterContentChecked,
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    QueryList,
    ViewChild,
    ViewEncapsulation,
    InjectionToken,
    Inject,
    Optional,
    Directive,
    Attribute,
    AfterViewInit,
    forwardRef
} from '@angular/core';
import { CanDisableCtor, KBQ_PARENT_ANIMATION_COMPONENT, mixinDisabled } from '@koobiq/components/core';
import { merge, Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { KbqTabHeader } from './tab-header.component';
import { KbqTab } from './tab.component';


@Directive({
    selector: 'kbq-tab-group[kbq-align-tabs-center], [kbq-tab-nav-bar][kbq-align-tabs-center]',
    host: { class: 'kbq-tab-group_align-labels-center' }
})
export class KbqAlignTabsCenterCssStyler {}

@Directive({
    selector: 'kbq-tab-group[kbq-align-tabs-end], [kbq-tab-nav-bar][kbq-align-tabs-end]',
    host: { class: 'kbq-tab-group_align-labels-end' }
})
export class KbqAlignTabsEndCssStyler {}

@Directive({
    selector: 'kbq-tab-group[kbq-stretch-tabs], [kbq-tab-nav-bar][kbq-stretch-tabs]',
    host: { class: 'kbq-tab-group_stretch-labels' }
})
export class KbqStretchTabsCssStyler {}

@Directive({
    selector: 'kbq-tab-group[vertical], [kbq-tab-nav-bar][vertical]',
    host: { class: 'kbq-tab-group_vertical' }
})
export class KbqVerticalTabsCssStyler {}

/** Used to generate unique ID's for each tab component */
let nextId = 0;

/** A simple change event emitted on focus or selection changes. */
export class KbqTabChangeEvent {
    /** Index of the currently-selected tab. */
    index: number;
    /** Reference to the currently-selected tab. */
    tab: KbqTab;
}

/** Possible positions for the tab header. */
export type KbqTabHeaderPosition = 'above' | 'below';

/** Object that can be used to configure the default options for the tabs module. */
export interface IKbqTabsConfig {
    /** Duration for the tab animation. Must be a valid CSS value (e.g. 600ms). */
    animationDuration?: string;
}

/** Injection token that can be used to provide the default options the tabs module. */
export const KBQ_TABS_CONFIG = new InjectionToken<string>('KBQ_TABS_CONFIG');

// Boilerplate for applying mixins to KbqTabGroup.
/** @docs-private */
export class KbqTabGroupBase {
    constructor(public elementRef: ElementRef) {}
}

/** @docs-private */
export const KbqTabGroupMixinBase: CanDisableCtor & typeof KbqTabGroupBase = mixinDisabled(KbqTabGroupBase);

/**
 * Tab-group component.  Supports basic tab pairs (label + content) and includes
 * keyboard navigation.
 */
@Component({
    selector: 'kbq-tab-group',
    exportAs: 'kbqTabGroup',
    templateUrl: 'tab-group.html',
    styleUrls: ['tab-group.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    inputs: ['disabled'],
    host: {
        class: 'kbq-tab-group',
        '[class.kbq-tab-group_filled]': '!transparent',
        '[class.kbq-tab-group_transparent]': 'transparent',
        '[class.kbq-tab-group_on-background]': '!onSurface',
        '[class.kbq-tab-group_on-surface]': 'onSurface',
        '[class.kbq-tab-group_dynamic-height]': 'dynamicHeight',
        '[class.kbq-tab-group_inverted-header]': 'headerPosition === "below"',
        '(window:resize)': 'resizeStream.next($event)'
    },
    providers: [{ provide: KBQ_PARENT_ANIMATION_COMPONENT, useExisting: forwardRef(() => this) }]
})
export class KbqTabGroup extends KbqTabGroupMixinBase implements AfterContentInit, AfterViewInit, AfterContentChecked, OnDestroy {
    readonly resizeStream = new Subject<Event>();

    vertical: boolean;

    @ContentChildren(KbqTab) tabs: QueryList<KbqTab>;

    @ViewChild('tabBodyWrapper', { static: false }) tabBodyWrapper: ElementRef;

    @ViewChild('tabHeader', { static: false }) tabHeader: KbqTabHeader;

    @Input() transparent: boolean = false;
    @Input() onSurface: boolean = false;

    /** Whether the tab group should grow to the size of the active tab. */
    @Input()
    get dynamicHeight(): boolean {
        return this._dynamicHeight;
    }

    set dynamicHeight(value: boolean) {
        this._dynamicHeight = coerceBooleanProperty(value);
    }

    private _dynamicHeight = false;

    /** The index of the active tab. */
    @Input()
    get selectedIndex(): number | null {
        return this._selectedIndex;
    }

    set selectedIndex(value: number | null) {
        this.indexToSelect = coerceNumberProperty(value, null);
    }

    private _selectedIndex: number | null = null;

    /** Position of the tab header. */
    @Input() headerPosition: KbqTabHeaderPosition = 'above';

    /** Duration for the tab animation. Must be a valid CSS value (e.g. 600ms). */
    @Input() animationDuration: string;

    /** Output to enable support for two-way binding on `[(selectedIndex)]` */
    @Output() readonly selectedIndexChange: EventEmitter<number> = new EventEmitter<number>();

    /** Event emitted when focus has changed within a tab group. */
    @Output() readonly focusChange: EventEmitter<KbqTabChangeEvent> = new EventEmitter<KbqTabChangeEvent>();

    /** Event emitted when the body animation has completed */
    @Output() readonly animationDone: EventEmitter<void> = new EventEmitter<void>();

    /** Event emitted when the tab selection has changed. */
    @Output() readonly selectedTabChange: EventEmitter<KbqTabChangeEvent> = new EventEmitter<KbqTabChangeEvent>(true);

    /** The tab index that should be selected after the content has been checked. */
    private indexToSelect: number | null = 0;

    /** Snapshot of the height of the tab body wrapper before another tab is activated. */
    private tabBodyWrapperHeight = 0;

    /** Subscription to tabs being added/removed. */
    private tabsSubscription = Subscription.EMPTY;

    /** Subscription to changes in the tab labels. */
    private tabLabelSubscription = Subscription.EMPTY;
    private resizeSubscription = Subscription.EMPTY;

    private readonly groupId: number;
    private readonly resizeDebounceInterval: number = 100;

    constructor(
        elementRef: ElementRef,
        private readonly changeDetectorRef: ChangeDetectorRef,
        @Attribute('vertical') vertical: string,
        @Inject(KBQ_TABS_CONFIG) @Optional() defaultConfig?: IKbqTabsConfig
    ) {
        super(elementRef);

        this.vertical = coerceBooleanProperty(vertical);

        this.groupId = nextId++;
        this.animationDuration = defaultConfig?.animationDuration || '0ms';

        this.subscribeToResize();
    }

    /**
     * After the content is checked, this component knows what tabs have been defined
     * and what the selected index should be. This is where we can know exactly what position
     * each tab should be in according to the new selected index, and additionally we know how
     * a new selected tab should transition in (from the left or right).
     */
    ngAfterContentChecked() {
        // Don't clamp the `indexToSelect` immediately in the setter because it can happen that
        // the amount of tabs changes before the actual change detection runs.
        const indexToSelect = this.indexToSelect = this.clampTabIndex(this.indexToSelect);

        // If there is a change in selected index, emit a change event. Should not trigger if
        // the selected index has not yet been initialized.
        if (this._selectedIndex !== indexToSelect) {
            const isFirstRun = this._selectedIndex == null;

            if (!isFirstRun) {
                this.selectedTabChange.emit(this.createChangeEvent(indexToSelect));
            }

            // Changing these values after change detection has run
            // since the checked content may contain references to them.
            Promise.resolve().then(() => {
                this.tabs.forEach((tab, index) => tab.isActive = index === indexToSelect);

                if (!isFirstRun) {
                    this.selectedIndexChange.emit(indexToSelect);
                }
            });
        }

        // Setup the position for each tab and optionally setup an origin on the next selected tab.
        this.tabs.forEach((tab: KbqTab, index: number) => {
            tab.position = index - indexToSelect;

            // If there is already a selected tab, then set up an origin for the next selected tab
            // if it doesn't have one already.
            if (this._selectedIndex != null && tab.position === 0 && !tab.origin) {
                tab.origin = indexToSelect - this._selectedIndex;
            }
        });

        if (this._selectedIndex !== indexToSelect) {
            this._selectedIndex = indexToSelect;
            this.changeDetectorRef.markForCheck();
        }
    }

    ngAfterContentInit() {
        this.subscribeToTabLabels();

        // Subscribe to changes in the amount of tabs, in order to be
        // able to re-render the content as new tabs are added or removed.
        this.tabsSubscription = this.tabs.changes
            .subscribe(() => {
                const indexToSelect = this.clampTabIndex(this.indexToSelect);

                // Maintain the previously-selected tab if a new tab is added or removed and there is no
                // explicit change that selects a different tab.
                if (indexToSelect === this._selectedIndex) {
                    const tabs = this.tabs.toArray();

                    for (let i = 0; i < tabs.length; i++) {
                        if (tabs[i].isActive) {
                            // Assign both to the `_indexToSelect` and `_selectedIndex` so we don't fire a changed
                            // event, otherwise the consumer may end up in an infinite loop in some edge cases like
                            // adding a tab within the `selectedIndexChange` event.
                            this.indexToSelect = this._selectedIndex = i;
                            break;
                        }
                    }
                }

                this.subscribeToTabLabels();
                this.changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {
        this.checkOverflow();
    }

    ngOnDestroy() {
        this.tabsSubscription.unsubscribe();
        this.tabLabelSubscription.unsubscribe();
        this.resizeSubscription.unsubscribe();
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
        if (!this._dynamicHeight || !this.tabBodyWrapperHeight) { return; }

        const wrapper: HTMLElement = this.tabBodyWrapper.nativeElement;

        wrapper.style.height = `${this.tabBodyWrapperHeight}px`;

        // This conditional forces the browser to paint the height so that
        // the animation to the new height can have an origin.
        if (this.tabBodyWrapper.nativeElement.offsetHeight) {
            wrapper.style.height = `${tabHeight}px`;
        }
    }

    /** Removes the height of the tab body wrapper. */
    removeTabBodyWrapperHeight(): void {
        this.tabBodyWrapperHeight = this.tabBodyWrapper.nativeElement.clientHeight;
        this.tabBodyWrapper.nativeElement.style.height = '';
        this.animationDone.emit();
    }

    /** Handle click events, setting new selected index if appropriate. */
    handleClick(tab: KbqTab, tabHeader: KbqTabHeader, index: number) {
        if (tab.disabled) { return; }

        this.selectedIndex = tabHeader.focusIndex = index;
    }

    /** Retrieves the tabindex for the tab. */
    getTabIndex(tab: KbqTab, index: number): number | null {
        if (tab.disabled) { return null; }

        return this.selectedIndex === index ? 0 : -1;
    }

    private checkOverflow = () => {
        this.tabHeader.items
            .forEach((headerTab) => headerTab.checkOverflow());
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
     * Subscribes to changes in the tab labels. This is needed, because the @Input for the label is
     * on the KbqTab component, whereas the data binding is inside the KbqTabGroup. In order for the
     * binding to be updated, we need to subscribe to changes in it and trigger change detection
     * manually.
     */
    private subscribeToTabLabels() {
        if (this.tabLabelSubscription) {
            this.tabLabelSubscription.unsubscribe();
        }

        this.tabLabelSubscription = merge(...this.tabs.map((tab) => tab.stateChanges))
            .subscribe(() => this.changeDetectorRef.markForCheck());
    }

    private subscribeToResize() {
        if (!this.vertical) { return; }

        if (this.resizeSubscription) {
            this.resizeSubscription.unsubscribe();
        }

        this.resizeSubscription = this.resizeStream
            .pipe(debounceTime(this.resizeDebounceInterval))
            .subscribe(this.checkOverflow);
    }

    /** Clamps the given index to the bounds of 0 and the tabs length. */
    private clampTabIndex(index: number | null): number {
        // Note the `|| 0`, which ensures that values like NaN can't get through
        // and which would otherwise throw the component into an infinite loop
        // (since Kbqh.max(NaN, 0) === NaN).
        return Math.min(this.tabs.length - 1, Math.max(index || 0, 0));
    }
}

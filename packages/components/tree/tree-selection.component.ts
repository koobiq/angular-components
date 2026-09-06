import { FocusMonitor } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { Platform } from '@angular/cdk/platform';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    effect,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostAttributeToken,
    inject,
    Input,
    input,
    IterableDiffer,
    OnDestroy,
    Output,
    output,
    QueryList,
    signal,
    viewChild,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    DOWN_ARROW,
    END,
    ENTER,
    FocusKeyManager,
    getKbqSelectNonArrayValueError,
    getSelectAllState,
    hasModifierKey,
    HOME,
    isCopy,
    isSelectAll,
    isVerticalMovement,
    KBQ_LOCALE_SERVICE,
    KbqLocaleService,
    KbqPseudoCheckbox,
    KbqPseudoCheckboxState,
    KbqSelectAllAdapter,
    LEFT_ARROW,
    MultipleMode,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    ruRULocaleData,
    SPACE,
    TAB,
    toggleSelectAll,
    UP_ARROW
} from '@koobiq/components/core';
import { KBQ_FORM_FIELD } from '@koobiq/components/form-field';
import { merge, Observable, Subscription } from 'rxjs';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { delay } from 'rxjs/operators';
import { FlatTreeControl } from './control/flat-tree-control';
import { KbqTreeNodeOutlet } from './outlet';
import { KbqTreeNodePadding } from './padding.directive';
import { KbqTreeBase } from './tree-base';
import { KBQ_TREE_OPTION_PARENT_COMPONENT, KbqTreeOption, KbqTreeOptionEvent } from './tree-option.component';

export const KBQ_SELECTION_TREE_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => KbqTreeSelection),
    multi: true
};

export class KbqTreeSelectAllEvent<T> {
    constructor(
        public source: KbqTreeSelection,
        public options: T[]
    ) {}
}

/**
 * Event class that occurs when copying an item from the KbqTreeSelection.
 * Used to pass data about the copied item and copy context.
 *
 * @param source - instance of KbqTreeSelection
 * @param option - instance of KbqTreeOption
 * @param event - original keyboard event (optional) that triggered the copy
 */
export class KbqTreeCopyEvent<T> {
    constructor(
        public source: KbqTreeSelection,
        public option: T,
        public event?: KeyboardEvent
    ) {}
}

export class KbqTreeNavigationChange<T> {
    constructor(
        public source: KbqTreeSelection,
        public option: T
    ) {}
}

export class KbqTreeSelectionChange<T> {
    constructor(
        public source: KbqTreeSelection,
        public option: T,
        public options?: T[]
    ) {}
}

interface SelectionModelOption {
    id: number | string;
    value: string;
}

@Component({
    selector: 'kbq-tree-selection',
    imports: [
        KbqTreeNodeOutlet,
        KbqTreeOption,
        KbqTreeNodePadding,
        KbqPseudoCheckbox
    ],
    // `kbqTreeNodePadding` on the "select all" row falls back to level 0 when the option has no `data`,
    // which is exactly where the row belongs: aligned with the root nodes below it.
    template: `
        @if (showSelectAll) {
            <!-- Every read of selectAllState re-filters the rendered nodes against the data set, and
                 allOptionsSelected is that same walk asking whether the state is "checked" — one read
                 covers all four. -->
            @let selectAllCheckboxState = selectAllState;

            <kbq-tree-option
                class="kbq-tree-option_select-all"
                kbqTreeNodePadding
                [selectAllRow]="true"
                [selectable]="false"
                [class.kbq-selected]="selectAllCheckboxState === 'checked'"
                [attr.role]="'checkbox'"
                [attr.aria-checked]="
                    selectAllCheckboxState === 'indeterminate' ? 'mixed' : selectAllCheckboxState === 'checked'
                "
                (click)="toggleSelectAll()"
            >
                <kbq-pseudo-checkbox [state]="selectAllCheckboxState" />
                {{ selectAllText }}
            </kbq-tree-option>
        }
        <ng-container kbqTreeNodeOutlet />
    `,
    styleUrls: ['./tree-selection.scss', 'tree-tokens.scss'],
    providers: [
        KBQ_SELECTION_TREE_VALUE_ACCESSOR,
        { provide: KBQ_TREE_OPTION_PARENT_COMPONENT, useExisting: KbqTreeSelection },
        { provide: KbqTreeBase, useExisting: KbqTreeSelection }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-tree-selection',
        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',
        '(blur)': 'blur()',
        '(focus)': 'focus($event)',
        '(keydown)': 'onKeyDown($event)',
        '(window:resize)': 'updateScrollSize()'
    },
    exportAs: 'kbqTreeSelection'
})
export class KbqTreeSelection
    extends KbqTreeBase<any>
    implements ControlValueAccessor, AfterContentInit, AfterViewInit, OnDestroy
{
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private scheduler = inject(AsyncScheduler);
    private clipboard = inject(Clipboard, { optional: true });
    private readonly platform = inject(Platform);
    protected readonly focusMonitor = inject(FocusMonitor);

    /**
     * Whether this tree-selection is rendered inside a select panel (enables option
     * hover-to-focus). Defaults to detecting a wrapping `KbqFormField`, and is forced to `true`
     * by the host `KbqTreeSelect` so hover works even when the tree-select has no form-field
     * wrapper (e.g. the filter-bar pipes render the tree-select bare).
     */
    inSelect = !!inject(KBQ_FORM_FIELD, { optional: true, host: true });

    renderedOptions = new QueryList<KbqTreeOption>();

    keyManager: FocusKeyManager<KbqTreeOption>;

    selectionModel: SelectionModel<SelectionModelOption>;

    resetFocusedItemOnBlur: boolean = true;

    multipleMode: MultipleMode | null = null;

    userTabIndex: number | null = null;

    // this parameter used when select has a search field
    optionShouldHoldFocusOnBlur: boolean = false;

    @ViewChild(KbqTreeNodeOutlet, { static: true }) declare nodeOutlet: KbqTreeNodeOutlet;

    /** Reference to the built-in "select all" row, rendered only while `selectAll` is on. */
    readonly selectAllOption = viewChild(KbqTreeOption);

    @ContentChildren(KbqTreeOption) unorderedOptions: QueryList<KbqTreeOption>;

    // TODO: Skipped for migration because:
    //  Class of this input is referenced in the signature of another class.
    @Input() declare treeControl: FlatTreeControl<any>;

    readonly navigationChange = output<KbqTreeNavigationChange<KbqTreeOption>>();

    @Output() readonly selectionChange = new EventEmitter<KbqTreeSelectionChange<KbqTreeOption>>();

    readonly onSelectAll = output<KbqTreeSelectAllEvent<KbqTreeOption>>();

    @Output() readonly onCopy = new EventEmitter<KbqTreeCopyEvent<KbqTreeOption>>();

    private sortedNodes: KbqTreeOption[] = [];

    private lastSyncedDataNodes: readonly any[] | null = null;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get autoSelect(): boolean {
        return this._autoSelect;
    }

    set autoSelect(value: boolean) {
        this._autoSelect = coerceBooleanProperty(value);
    }

    private _autoSelect: boolean = true;

    get optionFocusChanges(): Observable<KbqTreeOptionEvent> {
        return merge(...this.renderedOptions.map((option) => option.onFocus));
    }

    get optionBlurChanges(): Observable<KbqTreeOptionEvent> {
        return merge(...this.renderedOptions.map((option) => option.onBlur));
    }

    get multiple(): boolean {
        return !!this.multipleMode;
    }

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get noUnselectLast(): boolean {
        return this._noUnselectLast;
    }

    set noUnselectLast(value: boolean) {
        this._noUnselectLast = coerceBooleanProperty(value);
    }

    private _noUnselectLast: boolean = true;

    /** When `true`, a repeated Ctrl/Cmd+A deselects all options. Off by default (Ctrl+A only selects). */
    readonly selectAllToggle = input(false, { transform: booleanAttribute });

    /**
     * Whether to render the "select all" master checkbox above the nodes. Multiple selection only.
     *
     * Enabling it also makes Ctrl/Cmd + A a two-way toggle, so the shortcut and the checkbox never
     * disagree (`selectAllToggle` is implied).
     */
    // Written imperatively by `KbqTreeSelect`, like `autoSelect` and `noUnselectLast`, so it cannot be a
    // signal input; the signal behind it is what keeps the template in step.
    @Input({ transform: booleanAttribute })
    get selectAll(): boolean {
        return this.selectAllEnabled();
    }

    set selectAll(value: boolean) {
        this.selectAllEnabled.set(value);
    }

    private readonly selectAllEnabled = signal(false);

    /** Whether the "select all" row is currently rendered. */
    protected get showSelectAll(): boolean {
        return this.selectAll && this.multiple && !this.isEmpty;
    }

    /** Whether every node "select all" can act on is selected. */
    get allOptionsSelected(): boolean {
        const targets = this.selectAllTargets;

        // `[].every()` is `true`: with nothing for "select all" to act on, claiming "all selected" would
        // send the toggle down the deselect branch and check the master checkbox over an untouchable tree.
        return targets.length > 0 && targets.every((node) => this.selectionModel.isSelected(node));
    }

    /** State of the "select all" master checkbox. */
    get selectAllState(): KbqPseudoCheckboxState {
        return getSelectAllState(this.selectAllAdapter);
    }

    /** Label of the "select all" row. Kept in step with the locale service. */
    protected selectAllText: string = ruRULocaleData.select.selectAll;

    /**
     * Data nodes "select all" acts on, and the ones its checkbox state is derived from.
     *
     * While a filter is active only the rendered nodes qualify — the hidden ones are not what the user
     * is looking at, and selecting them would contradict a master checkbox that can only report on what
     * is on screen. Without a filter the whole data set qualifies, collapsed branches included.
     */
    // `any`, not `unknown`: `treeControl`/`selectionModel` are themselves `any`-typed data-node generics
    // pre-dating this feature (`KbqTreeBase<any>`, `SelectionModel<SelectionModelOption>`), so `unknown`
    // here would only relocate the unsafety into a cast at every call site, not remove it.
    private get selectAllTargets(): any[] {
        // `treeControl` is an `@Input`, so it is still unset on the change-detection pass that sets it:
        // a consumer reading `allOptionsSelected`/`selectAllState` off a template reference — which is
        // exactly how the docs suggest swapping the trigger label — would otherwise get a TypeError
        // before the tree is wired up. Nothing is selectable yet at that point, so an empty set is right.
        if (!this.treeControl) {
            return [];
        }

        const nonSelectableDataNodes = this.renderedOptions
            .filter((option) => option.disabled || !option.selectable())
            .map((option) => option.data);

        const candidates = this.treeControl.filterValue.value?.length
            ? this.renderedOptions.map((option) => option.data)
            : (this.treeControl.dataNodes ?? []);

        // The `includes` check comes first on purpose: the "select all" row is itself a non-selectable
        // rendered option with no `data`, and `isDisabled` belongs to the consumer — it must never be
        // handed a node their data source has never seen.
        return candidates.filter(
            (node) => !nonSelectableDataNodes.includes(node) && !this.treeControl.isDisabled(node)
        );
    }

    /** Adapter shared by the master checkbox and the Ctrl/Cmd + A handler, so the two cannot drift apart. */
    private get selectAllAdapter(): KbqSelectAllAdapter<any> {
        return {
            items: this.selectAllTargets,
            isSelectable: () => true,
            isSelected: (node) => this.selectionModel.isSelected(node),
            setSelected: (node, selected) =>
                selected ? this.selectionModel.select(node) : this.selectionModel.deselect(node)
        };
    }

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(rawValue: boolean) {
        const value = coerceBooleanProperty(rawValue);

        if (this._disabled !== value) {
            this._disabled = value;

            this.markOptionsForCheck();
        }
    }

    private _disabled: boolean = false;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get tabIndex(): any {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: any) {
        this._tabIndex = value;
        this.userTabIndex = value;
    }

    private _tabIndex = 0;

    get showCheckbox(): boolean {
        return this.multipleMode === MultipleMode.CHECKBOX;
    }

    get isEmpty(): boolean {
        return this.sortedNodes.length === 0;
    }

    /**
     * Number of real, data-backed nodes currently rendered — unlike `renderedOptions.length`, never
     * includes the "select all" row, which is appended to `renderedOptions` on its own, later-processed
     * reactive pass and would otherwise make a consumer's own node count race against that pass.
     */
    get nodesCount(): number {
        return this.sortedNodes.length;
    }

    private optionFocusSubscription: Subscription | null;

    private optionBlurSubscription: Subscription | null;

    private readonly localeService? = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE, { optional: true });

    /** Updates locale parameters from the locale service. */
    private updateLocaleParams = () => {
        // Locale data registered by a consumer through `KBQ_LOCALE_DATA`/`addLocale` may predate this key.
        this.selectAllText = this.localeService?.getParams('select')?.selectAll ?? ruRULocaleData.select.selectAll;

        this.changeDetectorRef.markForCheck();
    };

    constructor() {
        const multiple = inject(new HostAttributeToken('multiple'), { optional: true });

        super();

        if (multiple === MultipleMode.CHECKBOX || multiple === MultipleMode.KEYBOARD) {
            this.multipleMode = multiple;
        } else if (multiple !== null) {
            this.multipleMode = MultipleMode.CHECKBOX;
        }

        if (this.multipleMode === MultipleMode.CHECKBOX) {
            this.autoSelect = false;
            this.noUnselectLast = false;
        }

        this.selectionModel = new SelectionModel<SelectionModelOption>(this.multiple);

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        // `unorderedOptions.changes` never fires for the "select all" row — it is a view child — so the
        // rendered list has to be rebuilt whenever the view query resolves or drops it.
        effect(() => {
            this.selectAllOption();

            if (this.renderedOptions) {
                this.updateRenderedOptions();
            }
        });
    }

    /** Selects every node "select all" can act on, or deselects them all when they are already selected. */
    protected toggleSelectAll(): void {
        this.selectAllOptions(true);
    }

    ngAfterContentInit(): void {
        if (this.platform.isBrowser) {
            this.unorderedOptions.changes.subscribe(this.updateRenderedOptions);
        }

        this.keyManager = new FocusKeyManager<KbqTreeOption>(this.renderedOptions)
            .withVerticalOrientation(true)
            .withHorizontalOrientation(null);

        this.keyManager.change.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            if (this.keyManager.activeItem) {
                this.emitNavigationEvent(this.keyManager.activeItem);

                // todo need check this logic
                if (this.autoSelect && !this.keyManager.activeItem.disabled) {
                    this.updateOptionsFocus();
                }
            }
        });

        this.keyManager.tabOut.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.allowFocusEscape());

        this.selectionModel.changed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.onChange(this.getSelectedValues());

            this.renderedOptions.notifyOnChanges();
        });

        this.renderedOptions.changes
            .pipe(delay(0, this.scheduler), takeUntilDestroyed(this.destroyRef))
            .subscribe((options) => {
                this.resetOptions();

                // Check to see if we need to update our tab index
                this.updateTabIndex();

                this.syncSelectionModelToDataNodes();

                const selectedValues = this.multiple ? this.getSelectedValues() : [this.getSelectedValues()];

                options.forEach((option) => {
                    if (selectedValues.includes(option.value)) {
                        option.select(false);
                    } else {
                        option.deselect();
                    }

                    option.markForCheck();
                });
            });
    }

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef, true);
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();

        this.focusMonitor.stopMonitoring(this.elementRef);
    }

    focus($event): void {
        if (this.renderedOptions.length === 0 || this.isFocusReceivedFromNestedOption($event)) {
            return;
        }

        this.keyManager.setFocusOrigin('keyboard');

        if (this.selectionModel.selected.length) {
            this.highlightSelectedOption();
        } else {
            this.keyManager.setFirstItemActive();
        }

        this.keyManager.setFocusOrigin('program');
    }

    highlightSelectedOption(): void {
        this.renderedOptions.find((item) => item.data === this.selectionModel.selected[0])?.focus();
    }

    blur() {
        if (!this.hasFocusedOption() && this.resetFocusedItemOnBlur) {
            this.keyManager.setActiveItem(-1);
        }

        this.onTouched();
        this.changeDetectorRef.markForCheck();
    }

    onKeyDown(event: KeyboardEvent): void {
        this.keyManager.setFocusOrigin('keyboard');
        const keyCode = event.keyCode;

        if ([SPACE, LEFT_ARROW, RIGHT_ARROW].includes(keyCode) || isVerticalMovement(event)) {
            event.preventDefault();
        }

        if (this.multiple && isSelectAll(event)) {
            this.selectAllHandler(event, this);

            return;
        } else if (isCopy(event)) {
            this.copyActiveOption(event);

            return;
        } else if (keyCode === TAB) {
            this.keyManager.tabOut.next();

            return;
        } else if (keyCode === LEFT_ARROW && this.keyManager.activeItem) {
            const activeItem = this.keyManager.activeItem;

            if (activeItem.isExpandable && activeItem.isExpanded) {
                this.treeControl.collapse(activeItem.data as KbqTreeOption);
            } else {
                this.setActiveParentOption(activeItem);
            }

            return;
        } else if (keyCode === RIGHT_ARROW && this.keyManager.activeItem?.isExpandable) {
            this.treeControl.expand(this.keyManager.activeItem.data as KbqTreeOption);

            return;
        } else if (keyCode === DOWN_ARROW) {
            this.keyManager.setNextItemActive();
        } else if (keyCode === UP_ARROW) {
            this.keyManager.setPreviousItemActive();
        } else if ([SPACE, ENTER].includes(keyCode)) {
            this.toggleFocusedOption();

            return;
        } else if (keyCode === HOME) {
            this.keyManager.setFirstItemActive();
        } else if (keyCode === END) {
            this.keyManager.setLastItemActive();
        } else if (keyCode === PAGE_UP) {
            this.keyManager.setPreviousPageItemActive();
        } else if (keyCode === PAGE_DOWN) {
            this.keyManager.setNextPageItemActive();
        }

        if (this.keyManager.activeItem && isVerticalMovement(event)) {
            this.setSelectedOptionsByKey(
                this.keyManager.activeItem,
                hasModifierKey(event, 'shiftKey'),
                // ctrlKey is for Windows, metaKey is for MacOS
                hasModifierKey(event, 'ctrlKey', 'metaKey')
            );
        }
    }

    updateScrollSize(): void {
        if (!this.renderedOptions.first) {
            return;
        }

        this.keyManager.withScrollSize(Math.floor(this.getHeight() / this.renderedOptions.first.getHeight()));
    }

    setSelectedOptionsByKey(option: KbqTreeOption, shiftKey: boolean, ctrlKey: boolean): void {
        if (shiftKey && this.multiple) {
            this.selectActiveOptions();

            this.emitChangeEvent(option);
        } else if (ctrlKey) {
            if (!this.canDeselectLast(option)) {
                return;
            }
        } else if (this.autoSelect && option.selectable()) {
            this.selectionModel.clear();
            this.selectionModel.toggle(option.data);

            this.emitChangeEvent(option);
        }
    }

    setSelectedOptionsByClick(option: KbqTreeOption, shiftKey: boolean, ctrlKey: boolean): void {
        if (option.disabled || !option.selectable()) {
            return;
        }

        if (!shiftKey && !ctrlKey) {
            this.keyManager.setActiveItem(option);
        }

        if (shiftKey && this.multiple) {
            this.selectActiveOptions();
        } else if (ctrlKey) {
            if (!this.canDeselectLast(option)) {
                return;
            }

            this.selectionModel.toggle(option.data);
            this.keyManager.setActiveItem(option);
        } else if (this.autoSelect) {
            this.selectionModel.clear();
            this.selectionModel.toggle(option.data);
        } else {
            this.selectionModel.toggle(option.data);
        }

        this.emitChangeEvent(option);
    }

    selectActiveOptions(): void {
        const options = this.renderedOptions.toArray();

        let fromIndex = this.keyManager.previousActiveItemIndex;
        let toIndex = (this.keyManager.previousActiveItemIndex = this.keyManager.activeItemIndex);

        const selectedOptionState = options[fromIndex]?.selected;

        if (toIndex === fromIndex || fromIndex === -1) {
            if (options[toIndex]?.selectable()) {
                options[toIndex].toggle();
            }

            return;
        }

        if (fromIndex > toIndex) {
            [fromIndex, toIndex] = [toIndex, fromIndex];
        }

        options
            .slice(fromIndex, toIndex + 1)
            .filter((item) => !item.disabled && item.selectable())
            .forEach((renderedOption) => {
                if (!selectedOptionState && this.noUnselectLast && this.selectionModel.selected.length === 1) {
                    return;
                }

                renderedOption.setSelected(selectedOptionState);
            });
    }

    setFocusedOption(option: KbqTreeOption): void {
        this.keyManager.setActiveItem(option);
    }

    toggleFocusedOption(): void {
        const focusedOption = this.keyManager.activeItem;

        // The row is not selectable, so nothing below would act on it. Handling it here covers both focus
        // positions — the row itself and the search field a wrapping select keeps focus in.
        if (focusedOption && focusedOption === this.selectAllOption()) {
            this.toggleSelectAll();

            return;
        }

        if (!focusedOption?.selectable()) return;

        if (focusedOption && (!focusedOption.selected || this.canDeselectLast(focusedOption))) {
            this.selectionModel.toggle(focusedOption.data);
            this.emitChangeEvent(focusedOption);
        }
    }

    renderNodeChanges(
        data: KbqTreeOption[],
        dataDiffer: IterableDiffer<KbqTreeOption> = this.dataDiffer,
        viewContainer: ViewContainerRef = this.nodeOutlet.viewContainer,
        parentData?: KbqTreeOption
    ): void {
        super.renderNodeChanges(data, dataDiffer, viewContainer, parentData);

        this.sortedNodes = this.getSortedNodes(viewContainer);

        this.nodeOutlet.changeDetectorRef.detectChanges();
    }

    emitNavigationEvent(option: KbqTreeOption): void {
        this.navigationChange.emit(new KbqTreeNavigationChange(this, option));
    }

    emitChangeEvent(option: KbqTreeOption): void {
        this.selectionChange.emit(new KbqTreeSelectionChange(this, option, [option]));
    }

    /**
     * Function for handling the combination Ctrl + A (select all). By default, the internal handler is used,
     * which toggles the selection of all non-disabled, selectable options.
     */
    @Input()
    get selectAllHandler() {
        return this._selectAllHandler;
    }

    set selectAllHandler(fn: (event: KeyboardEvent, tree: KbqTreeSelection) => void) {
        if (typeof fn !== 'function') {
            throw Error('`selectAllHandler` must be a function.');
        }

        this._selectAllHandler = fn;
    }

    private _selectAllHandler(event: KeyboardEvent, tree: KbqTreeSelection): void {
        event.preventDefault();

        tree.selectAllOptions();
    }

    selectAllOptions(allowDeselect: boolean = this.selectAll || this.selectAllToggle()): void {
        // The row's own `(click)` and the Ctrl/Cmd + A shortcut both funnel through here, so this is the
        // single place to refuse acting while the whole tree is disabled — mirrors the guard every other
        // row already gets via `KbqTreeOption.selectViaInteraction()`.
        if (this.disabled) return;

        // Selection is applied at the data-node level (incl. collapsed/non-rendered nodes unless a filter
        // is active), while the emitted events carry the selectable rendered options.
        const selectableOptions = this.renderedOptions.filter((option) => !option.disabled && option.selectable());

        // `toggleSelectAll` returns the data nodes whose selection actually flipped — the source of
        // truth, unlike the cached `option.selected` which lags until change detection.
        const changed = toggleSelectAll(this.selectAllAdapter, { allowDeselect });

        const changedData = new Set(changed);
        const changedOptions = selectableOptions.filter((option) => changedData.has(option.data));

        // Skip `selectionChange` on a no-op (e.g. Ctrl+A while everything is already selected and
        // `allowDeselect` is off) so `KbqTreeSelectionChange.option` is never `undefined`.
        if (changedOptions.length > 0) {
            this.selectionChange.emit(new KbqTreeSelectionChange(this, changedOptions[0], changedOptions));
        }

        this.onSelectAll.emit(new KbqTreeSelectAllEvent(this, selectableOptions));
    }

    copyActiveOption(event: KeyboardEvent): void {
        if (!this.keyManager.activeItem) return;

        const option = this.keyManager.activeItem;

        option.preventBlur = true;

        if (this.onCopy.observed) {
            this.onCopy.emit(new KbqTreeCopyEvent(this, this.keyManager.activeItem as KbqTreeOption, event));
        } else {
            this.onCopyDefaultHandler();

            event.preventDefault();
        }

        option.preventBlur = false;
    }

    writeValue(value: any): void {
        if (this.multiple && value && !Array.isArray(value)) {
            throw getKbqSelectNonArrayValueError();
        }

        if (value) {
            this.setOptionsFromValues(this.multiple ? value : [value]);
        } else {
            this.selectionModel.clear();
        }
    }

    /** `View -> model callback called when value changes` */
    onChange: (value: any) => void = () => {};

    registerOnChange(fn: (value: any) => void): void {
        this.onChange = fn;
    }

    /** `View -> model callback called when select has been touched` */
    onTouched = () => {};

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    registerOnTouched(fn: () => {}): void {
        this.onTouched = fn;
    }

    /**
     * Sets the disabled state of the control. Implemented as a part of ControlValueAccessor.
     */
    setDisabledState(isDisabled: boolean): void {
        this._disabled = isDisabled;
        this.changeDetectorRef.markForCheck();
    }

    setOptionsFromValues(values: any[]): void {
        this.selectionModel.clear();

        const valuesToSelect = values.reduce((result, value) => {
            return this.treeControl.hasValue(value) ? [...result, this.treeControl.hasValue(value)] : [...result];
        }, []);

        this.selectionModel.select(...valuesToSelect);
    }

    /**
     * Rebinds orphan node references in selectionModel to current treeControl.dataNodes by value.
     * Needed after dataSource.data is replaced — selectionModel holds references to old node
     * objects, but options render with new ones, so toggle()/isSelected() break on identity.
     */
    private syncSelectionModelToDataNodes(): void {
        const currentNodes = this.treeControl.dataNodes;

        // Fast path: dataNodes ref hasn't changed since last sync → orphans impossible.
        // Skips work on filter / expand / selection-toggle re-renders where data ref is stable.
        if (currentNodes === this.lastSyncedDataNodes) return;
        this.lastSyncedDataNodes = currentNodes;

        if (this.selectionModel.isEmpty() || !currentNodes?.length) return;

        const selected = this.selectionModel.selected;
        const currentNodesSet = new Set<any>(currentNodes);

        let hasOrphans = false;

        for (const node of selected) {
            if (!currentNodesSet.has(node)) {
                hasOrphans = true;
                break;
            }
        }

        if (!hasOrphans) return;

        const reconciled = selected.map((node) => {
            if (currentNodesSet.has(node)) return node;

            const replacement = this.treeControl.hasValue(this.treeControl.getValue(node));

            return replacement ?? node;
        });

        this.selectionModel.setSelection(...reconciled);
    }

    getSelectedValues(): any[] {
        const selectedValues = this.selectionModel.selected.map((selected) => this.treeControl.getValue(selected));

        return this.multiple ? selectedValues : selectedValues[0];
    }

    getItemHeight(): number {
        return this.renderedOptions.first ? this.renderedOptions.first.getHeight() : 0;
    }

    setStateChildren(option: KbqTreeOption, state: boolean) {
        const valuesToChange = this.treeControl.getDescendants(option.data);

        if (state) {
            this.selectionModel.select(...valuesToChange);
        } else {
            this.selectionModel.deselect(...valuesToChange);
        }
    }

    private onCopyDefaultHandler(): void {
        this.clipboard?.copy(this.keyManager.activeItem!.value);
    }

    /**
     * Moves focus to the closest enabled ancestor of the active option — ArrowLeft on a leaf, on an
     * already-collapsed node, or on a node whose toggle is disabled.
     *
     * Ancestors are resolved against `renderedOptions` rather than `treeControl.dataNodes`: every
     * ancestor of a visible option is itself visible, options are rendered depth-first, and these are
     * the indices `keyManager` navigates — so the walk starts from `keyManager.activeItemIndex`.
     * Scanning backwards, the first option with a smaller level is the parent.
     *
     * A disabled option cannot take focus (`KbqTreeOption.focus` refuses it), so the walk steps over a
     * disabled ancestor and narrows `level` to that ancestor's level. Without narrowing, the scan would
     * continue against the original level and land on a preceding sibling of the parent.
     */
    private setActiveParentOption(activeOption: KbqTreeOption): void {
        const options = this.renderedOptions.toArray();

        let level = activeOption.level;

        for (let index = this.keyManager.activeItemIndex - 1; index >= 0; index--) {
            const option = options[index];

            if (option.level >= level) {
                continue;
            }

            if (!option.disabled) {
                this.keyManager.setActiveItem(index);

                return;
            }

            level = option.level;
        }
    }

    private getHeight(): number {
        return this.elementRef.nativeElement.getClientRects()[0]?.height ?? 0;
    }

    private updateTabIndex(): void {
        this._tabIndex = this.renderedOptions.length === 0 ? -1 : 0;
    }

    private updateRenderedOptions = () => {
        const orderedOptions: KbqTreeOption[] = [];

        // The "select all" row is rendered by this component's own template, so it never reaches the
        // `unorderedOptions` content query — but it is the first thing on screen and has to lead the
        // list the key manager navigates.
        const selectAllOption = this.selectAllOption();

        if (selectAllOption) {
            orderedOptions.push(selectAllOption);
        }

        this.sortedNodes.forEach((node) => {
            const found = this.unorderedOptions.find((option) => option.value === this.treeControl.getValue(node));

            if (found) {
                orderedOptions.push(found);
            }
        });

        this.renderedOptions.reset(orderedOptions);
        this.renderedOptions.notifyOnChanges();

        this.updateScrollSize();
    };

    private getSortedNodes(viewContainer: ViewContainerRef) {
        const array: KbqTreeOption[] = [];

        for (let i = 0; i < viewContainer.length; i++) {
            const viewRef = viewContainer.get(i) as any;

            array.push(viewRef.context.$implicit);
        }

        return array;
    }

    private allowFocusEscape() {
        if (this._tabIndex !== -1) {
            this._tabIndex = -1;

            setTimeout(() => {
                this._tabIndex = this.userTabIndex || 0;
                this.changeDetectorRef.markForCheck();
            });
        }
    }

    private resetOptions() {
        this.dropSubscriptions();
        this.listenToOptionsFocus();
    }

    private dropSubscriptions() {
        if (this.optionFocusSubscription) {
            this.optionFocusSubscription.unsubscribe();
            this.optionFocusSubscription = null;
        }

        if (this.optionBlurSubscription) {
            this.optionBlurSubscription.unsubscribe();
            this.optionBlurSubscription = null;
        }
    }

    private listenToOptionsFocus(): void {
        this.optionFocusSubscription = this.optionFocusChanges.subscribe((event) => {
            const index: number = this.renderedOptions.toArray().indexOf(event.option as KbqTreeOption);

            this.renderedOptions.filter((option) => option.hasFocus).forEach((option) => (option.hasFocus = false));

            if (this.isValidIndex(index)) {
                this.keyManager.updateActiveItem(index);
            }
        });

        this.optionBlurSubscription = this.optionBlurChanges.subscribe(() => this.blur());
    }

    /**
     * Utility to ensure all indexes are valid.
     * @param index The index to be checked.
     * @returns True if the index is valid for our list of options.
     */
    private isValidIndex(index: number): boolean {
        return index >= 0 && index < this.renderedOptions.length;
    }

    /** Checks whether any of the options is focused. */
    private hasFocusedOption() {
        return this.renderedOptions.some((option) => option.hasFocus);
    }

    private markOptionsForCheck() {
        this.renderedOptions.forEach((option) => option.markForCheck());
    }

    private updateOptionsFocus() {
        this.renderedOptions.filter((option) => option.hasFocus).forEach((option) => (option.hasFocus = false));
    }

    private canDeselectLast(option: KbqTreeOption): boolean {
        return !(this.noUnselectLast && this.selectionModel.selected.length === 1 && option.selected);
    }

    private isFocusReceivedFromNestedOption($event: FocusEvent) {
        if (!$event || !$event.relatedTarget) {
            return false;
        }

        return ($event.relatedTarget as HTMLElement).classList.contains('kbq-tree-option');
    }
}

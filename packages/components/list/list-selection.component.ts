import { FocusMonitor } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Platform } from '@angular/cdk/platform';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    contentChild,
    ContentChildren,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostAttributeToken,
    inject,
    Input,
    input,
    isDevMode,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    output,
    QueryList,
    signal,
    ViewChild,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    DOWN_ARROW,
    END,
    ENTER,
    FocusKeyManager,
    hasModifierKey,
    HOME,
    IFocusableOption,
    isCopy,
    isSelectAll,
    isVerticalMovement,
    KBQ_OPTION_ACTION_PARENT,
    KBQ_TITLE_TEXT_REF,
    KbqActionContainer,
    kbqFocusOptionActionOnTab,
    kbqInjectA11yLocaleConfiguration,
    KbqOptgroup,
    KbqOptionActionComponent,
    KbqPseudoCheckbox,
    KbqTitleTextRef,
    LEFT_ARROW,
    MultipleMode,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    SPACE,
    TAB,
    toggleSelectAll,
    UP_ARROW
} from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { startWith, take } from 'rxjs/operators';

export interface KbqOptionEvent {
    option: KbqListOption;
}
export const KBQ_SELECTION_LIST_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => KbqListSelection),
    multi: true
};

export class KbqListSelectionChange {
    constructor(
        public source: KbqListSelection,
        public option: KbqListOption
    ) {}
}

export class KbqListSelectAllEvent<T> {
    constructor(
        public source: KbqListSelection,
        public options: T[]
    ) {}
}

/**
 * Event class that occurs when copying an item from the KbqListSelection.
 * Used to pass data about the copied item and copy context.
 *
 * @param source - instance of KbqListSelection
 * @param option - instance of KbqListOption
 * @param event - original keyboard event (optional) that triggered the copy
 */
export class KbqListCopyEvent<T> {
    constructor(
        public source: KbqListSelection,
        public option: T,
        public event?: KeyboardEvent
    ) {}
}

/**
 * Data attached to the underlying `CdkDrag` while a list option is being dragged.
 *
 * @docs-private
 */
export type KbqListOptionDragData = { option: KbqListOption };

/** Event emitted when an option changes its position by dragging or by keyboard. */
export type KbqListSelectionDroppedEvent = Pick<CdkDragDrop<unknown>, 'previousIndex' | 'currentIndex'> & {
    /** Option that has been moved. */
    option: KbqListOption;
    /** List the option has been moved into. */
    container: KbqListSelection;
    /** List the option has been taken from. Equal to `container` when reordering within a single list. */
    previousContainer: KbqListSelection;
    /** Pointer event for dragging, keyboard event for `Alt` + arrow reordering. */
    event: MouseEvent | TouchEvent | KeyboardEvent;
};

/**
 * Whether `Alt` is the only modifier held. `hasModifierKey` matches any of the listed modifiers,
 * which would also swallow combinations already bound to selection (`Ctrl`/`Shift` + arrow).
 */
const isAltOnly = (event: KeyboardEvent): boolean =>
    event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;

@Component({
    selector: 'kbq-list-selection',
    template: `
        <ng-content />
        <!-- Announces a reordered option to assistive tech (WCAG 4.1.3). Kept last so that it does not
             break the adjacent-sibling rules that merge the corners of selected options, and kept
             unconditional: a move is announced only once the consumer applies it, which may land after
             dragging has been turned off again, and a live region has to pre-exist its own text. -->
        <div class="cdk-visually-hidden" aria-live="polite" aria-atomic="true">{{ announcement() }}</div>
    `,
    styleUrls: ['./list.scss', 'list-tokens.scss'],
    providers: [KBQ_SELECTION_LIST_VALUE_ACCESSOR],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-list-selection',
        '[class.kbq-list-selection_draggable]': 'draggable',
        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',
        '(keydown)': 'onKeyDown($event)',
        '(focus)': 'focus()',
        '(blur)': 'blur()',
        '(window:resize)': 'updateScrollSize()'
    },
    // `id` is exposed so that a consumer-set id survives `CdkDropList`'s own `[attr.id]` host binding
    // and can be used as a `connectedTo` reference.
    hostDirectives: [{ directive: CdkDropList, inputs: ['id'] }],
    exportAs: 'kbqListSelection',
    preserveWhitespaces: false
})
export class KbqListSelection implements AfterContentInit, AfterViewInit, OnDestroy, ControlValueAccessor {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private changeDetectorRef = inject(ChangeDetectorRef);
    private clipboard = inject(Clipboard, { optional: true });
    protected readonly focusMonitor = inject(FocusMonitor);

    keyManager: FocusKeyManager<KbqListOption>;

    @ContentChildren(forwardRef(() => KbqListOption), { descendants: true }) options: QueryList<KbqListOption>;

    readonly onSelectAll = output<KbqListSelectAllEvent<KbqListOption>>();

    @Output() readonly onCopy = new EventEmitter<KbqListCopyEvent<KbqListOption>>();

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

    /**
     * Whether options can be reordered by dragging them or by pressing `Alt` + arrow keys.
     * Reordering never mutates the data — handle the `dropped` event and move the item yourself.
     */
    @Input({ transform: booleanAttribute })
    get draggable(): boolean {
        return this._draggable && !this.disabled;
    }

    set draggable(value: boolean) {
        this._draggable = value;
        this.syncDraggableState();
    }

    private _draggable: boolean = false;

    /**
     * Lists that options of this list can be moved into. Accepts `KbqListSelection` instances or the
     * `id` of another list. `cdkDropListGroup` on a common ancestor connects lists automatically.
     */
    readonly connectedTo = input<KbqListSelection | string | readonly (KbqListSelection | string)[]>([]);

    /** Emits when an option changes its position by dragging or by `Alt` + arrow keys. */
    readonly dropped = output<KbqListSelectionDroppedEvent>();

    /**
     * Reordering shortcuts advertised on a draggable option, so that the keyboard alternative to
     * dragging is discoverable without the documentation. Transfer shortcuts are left out when no
     * connected list can be reached by keyboard.
     *
     * @docs-private
     */
    get ariaKeyShortcuts(): string {
        const reorder = 'Alt+ArrowUp Alt+ArrowDown';

        return this.getAdjacentList('next') ? `${reorder} Alt+ArrowLeft Alt+ArrowRight` : reorder;
    }

    /** When `true`, a repeated Ctrl/Cmd+A deselects all options. Off by default (Ctrl+A only selects). */
    readonly selectAllToggle = input(false, { transform: booleanAttribute });

    multipleMode: MultipleMode | null;

    get multiple(): boolean {
        return !!this.multipleMode;
    }

    readonly horizontal = input<boolean, unknown>(false, { transform: booleanAttribute });

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get tabIndex(): any {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: any) {
        this.userTabIndex = value;
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this.disabled) {
            this._disabled = value;
            this.syncDraggableState();
        }
    }

    private _disabled: boolean = false;

    /**
     * Function used for comparing an option against the selected value when determining which
     * options should appear as selected. The first argument is the value of an options. The second
     * one is a value from the selected value. A boolean must be returned.
     */
    readonly compareWith = input<(o1: any, o2: any) => boolean>((a1, a2) => a1 === a2);

    userTabIndex: number | null = null;

    get showCheckbox(): boolean {
        return this.multipleMode === MultipleMode.CHECKBOX;
    }

    // Emits a change event whenever the selected state of an option changes.
    readonly selectionChange = output<KbqListSelectionChange>();

    selectionModel: SelectionModel<KbqListOption>;

    get optionFocusChanges(): Observable<KbqOptionEvent> {
        return merge(...this.options.map((option) => option.onFocus));
    }

    get optionBlurChanges(): Observable<KbqOptionEvent> {
        return merge(...this.options.map((option) => option.onBlur));
    }

    _value: string[] | null;

    private readonly destroyRef = inject(DestroyRef);
    private readonly platform = inject(Platform);
    private readonly dropList = inject<CdkDropList<KbqListSelection>>(CdkDropList, { host: true });
    private readonly a11yLocale = kbqInjectA11yLocaleConfiguration();

    /** Message read out by assistive tech after an option has been reordered. */
    protected readonly announcement = signal('');

    private optionFocusSubscription: Subscription | null;

    private optionBlurSubscription: Subscription | null;

    private pendingMoveSubscription: Subscription | null;

    constructor() {
        const multiple = inject(new HostAttributeToken('multiple'), { optional: true });

        if (multiple === MultipleMode.CHECKBOX || multiple === MultipleMode.KEYBOARD) {
            this.multipleMode = multiple;
        } else if (multiple !== null) {
            this.multipleMode = MultipleMode.CHECKBOX;
        }

        if (this.multipleMode === MultipleMode.CHECKBOX) {
            this.autoSelect = false;
            this.noUnselectLast = false;
        }

        this.selectionModel = new SelectionModel<KbqListOption>(this.multiple);

        this.setupDropListInitialProperties();
    }

    ngAfterContentInit(): void {
        this.keyManager = new FocusKeyManager<KbqListOption>(this.options)
            .withTypeAhead()
            .withVerticalOrientation(!this.horizontal())
            .withHorizontalOrientation(this.horizontal() ? 'ltr' : null);

        this.keyManager.tabOut.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this._tabIndex = -1;

            setTimeout(() => {
                this._tabIndex = this.userTabIndex || 0;
                this.changeDetectorRef.markForCheck();
            });
        });

        if (this._value) {
            this.setOptionsFromValues(this._value);
        }

        this.selectionModel.changed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
            for (const item of event.added) {
                item.selected = true;
            }

            for (const item of event.removed) {
                item.selected = false;
            }
        });

        this.options.changes.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.resetOptions();

            this.updateTabIndex();
            this.initializeSelection();
        });

        if (!this.platform.isBrowser) return;

        this.warnOnUnsupportedDragContainer();
        this.updateScrollSize();
    }

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef, true);
    }

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this.elementRef);
    }

    focus(): void {
        if (this.options.length === 0) {
            return;
        }

        if (this.selectionModel.selected.length) {
            this.options.find((option) => option.selected)?.focus();
        } else {
            this.keyManager.setFirstItemActive();
        }
    }

    /**
     * Moves keyboard focus to the option matching `value` through `compareWith`. Use it to restore
     * focus after a `dropped` event has moved an option into another list, where the original option
     * instance no longer exists.
     *
     * @returns whether a matching option was found.
     */
    focusOptionByValue(value: unknown): boolean {
        const index = this.options.toArray().findIndex((option) => this.compareWith()(option.value, value));

        if (index === -1) {
            return false;
        }

        this.keyManager.setActiveItem(index);

        return true;
    }

    blur() {
        if (!this.hasFocusedOption()) {
            this.keyManager.setActiveItem(-1);
        }

        this.onTouched();
        this.changeDetectorRef.markForCheck();
    }

    selectAll() {
        this.options.forEach((option) => option.setSelected(true));

        this.reportValueChange();
    }

    deselectAll() {
        this.options.forEach((option) => option.setSelected(false));

        this.reportValueChange();
    }

    updateScrollSize(): void {
        if (this.horizontal() || !this.options.first) {
            return;
        }

        this.keyManager.withScrollSize(Math.floor(this.getHeight() / this.options.first.getHeight()));
    }

    setSelectedOptionsByClick(option: KbqListOption, shiftKey: boolean, ctrlKey: boolean): void {
        if (shiftKey && this.multiple) {
            this.selectActiveOptions();
        } else if (ctrlKey) {
            if (!this.canDeselectLast(option)) {
                return;
            }

            this.selectionModel.toggle(option);
        } else if (this.autoSelect) {
            this.selectionModel.clear();
            this.selectionModel.toggle(option);
        } else {
            this.selectionModel.toggle(option);
        }

        this.emitChangeEvent(option);
        this.reportValueChange();
    }

    setSelectedOptionsByKey(option: KbqListOption, shiftKey: boolean, ctrlKey: boolean): void {
        if (shiftKey && this.multiple) {
            this.selectActiveOptions();
        } else if (ctrlKey) {
            if (!this.canDeselectLast(option)) {
                return;
            }
        } else if (this.autoSelect) {
            this.options.forEach((item) => item.setSelected(false));
            option.setSelected(true);
        }

        if (shiftKey || ctrlKey || this.autoSelect) {
            this.emitChangeEvent(option);
            this.reportValueChange();
        }
    }

    selectActiveOptions(): void {
        const options = this.options.toArray();
        let fromIndex = this.keyManager.previousActiveItemIndex;
        let toIndex = (this.keyManager.previousActiveItemIndex = this.keyManager.activeItemIndex);

        // `previousActiveItemIndex` is -1 until the list has been navigated, so a shift+click without
        // prior keyboard navigation has no range to extend.
        if (toIndex === fromIndex || !this.isValidIndex(fromIndex)) {
            return;
        }

        const selectedOptionState = options[fromIndex].selected;

        if (fromIndex > toIndex) {
            [fromIndex, toIndex] = [toIndex, fromIndex];
        }

        options
            .slice(fromIndex, toIndex + 1)
            .filter((item) => !item.disabled)
            .forEach((renderedOption) => {
                if (!selectedOptionState && this.noUnselectLast && this.selectionModel.selected.length === 1) {
                    return;
                }

                renderedOption.setSelected(selectedOptionState);
            });
    }

    // Implemented as part of ControlValueAccessor.
    writeValue(values: string[]): void {
        this._value = values;

        if (this.options) {
            this.setOptionsFromValues(Array.isArray(values) ? values : [values]);
        }
    }

    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn: (value: any) => void): void {
        this.onChange = fn;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    // Implemented as a part of ControlValueAccessor.
    setDisabledState(isDisabled: boolean): void {
        if (this.options) {
            this.options.forEach((option) => (option.disabled = isDisabled));
        }
    }

    getSelectedOptionValues(): string[] {
        return this.options.filter((option) => option.selected).map((option) => option.value);
    }

    // Toggles the selected state of the currently focused option.
    toggleFocusedOption(): void {
        const focusedIndex = this.keyManager.activeItemIndex;

        if (focusedIndex != null && this.isValidIndex(focusedIndex)) {
            const focusedOption: KbqListOption = this.options.toArray()[focusedIndex];

            if (focusedOption && this.canDeselectLast(focusedOption)) {
                focusedOption.toggle();

                // Emit a change event because the focused option changed its state through user interaction.
                this.emitChangeEvent(focusedOption);
                this.reportValueChange();
            }
        }
    }

    canDeselectLast(listOption: KbqListOption): boolean {
        return !(this.noUnselectLast && this.selectionModel.selected.length === 1 && listOption.selected);
    }

    /** @docs-private */
    getHeight(): number {
        return this.elementRef.nativeElement.getClientRects()[0]?.height ?? 0;
    }

    // View to model callback that should be called if the list or its options lost focus.
    onTouched: () => void = () => {};

    // Removes an option from the selection list and updates the active item.
    removeOptionFromList(option: KbqListOption) {
        if (!option.hasFocus) {
            return;
        }

        const optionIndex = this.getOptionIndex(option);

        // Check whether the option is the last item
        if (optionIndex === this.options.length - 1) {
            this.keyManager.setPreviousItemActive();
        } else {
            this.keyManager.setNextItemActive();
        }
    }

    /** Handles keydown events on the list. */
    onKeyDown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;

        if ([SPACE, ENTER, LEFT_ARROW, RIGHT_ARROW].includes(keyCode) || isVerticalMovement(event)) {
            event.preventDefault();
        }

        if (this.draggable && isAltOnly(event) && [UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW].includes(keyCode)) {
            this.moveActiveOptionByKey(event);

            return;
        }

        if (this.multiple && isSelectAll(event)) {
            this.selectAllHandler(event, this);

            return;
        } else if (isCopy(event)) {
            this.copyActiveOption(event);

            return;
        } else if ([SPACE, ENTER].includes(keyCode)) {
            this.toggleFocusedOption();

            return;
        } else if (keyCode === TAB) {
            this.keyManager.tabOut.next();

            return;
        } else if (keyCode === DOWN_ARROW) {
            this.keyManager.setNextItemActive();
        } else if (keyCode === UP_ARROW) {
            this.keyManager.setPreviousItemActive();
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
                this.keyManager.activeItem as KbqListOption,
                hasModifierKey(event, 'shiftKey'),
                // ctrlKey is for Windows, metaKey is for MacOS
                hasModifierKey(event, 'ctrlKey', 'metaKey')
            );
        }
    }

    // Reports a value change to the ControlValueAccessor
    reportValueChange() {
        if (this.options) {
            const value = this.getSelectedOptionValues();

            this.onChange(value);
            this._value = value;
        }
    }

    // Emits a change event if the selected state of an option changed.
    emitChangeEvent(option: KbqListOption) {
        this.selectionChange.emit(new KbqListSelectionChange(this, option));
    }

    private initializeSelection(): void {
        // Defer setting the value in order to avoid the "Expression
        // has changed after it was checked" errors from Angular.
        Promise.resolve().then(() => {
            if (this._value) {
                this.setOptionsFromValues(Array.isArray(this._value) ? this._value : [this._value]);
            }
        });
    }

    protected updateTabIndex(): void {
        // Check to see if we need to update our tab index
        this._tabIndex = this.userTabIndex || (this.options.length === 0 ? -1 : 0);
    }

    private onCopyDefaultHandler(): void {
        this.clipboard?.copy(this.keyManager.activeItem!.value);
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
            const index: number = this.options.toArray().indexOf(event.option);

            if (this.isValidIndex(index)) {
                this.keyManager.updateActiveItem(index);
            }
        });

        this.optionBlurSubscription = this.optionBlurChanges.subscribe(() => this.blur());
    }

    /** Checks whether any of the options is focused. */
    private hasFocusedOption() {
        return this.options.some((option) => option.hasFocus);
    }

    // Returns the option with the specified value.
    private getOptionByValue(value: string): KbqListOption | undefined {
        return this.options.find((option) => this.compareWith()(option.value, value));
    }

    // Sets the selected options based on the specified values.
    private setOptionsFromValues(values: string[]) {
        this.options.forEach((option) => option.setSelected(false));

        values
            .map((value) => this.getOptionByValue(value))
            .filter(Boolean)
            .forEach((option) => option!.setSelected(true));
    }

    /**
     * Utility to ensure all indexes are valid.
     * @param index The index to be checked.
     * @returns True if the index is valid for our list of options.
     */
    private isValidIndex(index: number): boolean {
        return index >= 0 && index < this.options.length;
    }

    // Returns the index of the specified list option.
    private getOptionIndex(option: KbqListOption): number {
        return this.options.toArray().indexOf(option);
    }

    private setupDropListInitialProperties(): void {
        // Lets the `dropped` handler map a `CdkDropList` back to the list that owns it.
        this.dropList.data = this;
        this.syncDraggableState();

        effect(() => {
            this.dropList.orientation = this.horizontal() ? 'horizontal' : 'vertical';
            // `CdkDropList` resolves its siblings on every drag start, so a late assignment is picked up.
            this.dropList.connectedTo = this.resolveConnectedDropLists();
        });

        this.dropList.dropped
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(({ previousIndex, currentIndex, previousContainer, container, item, event }) => {
                const { option }: KbqListOptionDragData = item.data;

                this.emitDropped({
                    option,
                    previousIndex,
                    currentIndex,
                    previousContainer: previousContainer.data,
                    container: container.data,
                    event
                });
            });
    }

    /**
     * Both containers break the index space `dropped` reports: `CdkDropList` numbers only the options
     * it has rendered, and an option inside a group is numbered within that group. Either way the
     * indices do not address the consumer's backing array and the move silently lands on the wrong
     * item, so warn instead of letting it pass unnoticed.
     */
    private warnOnUnsupportedDragContainer(): void {
        if (!isDevMode() || !this.draggable) {
            return;
        }

        if (this.elementRef.nativeElement.querySelector('cdk-virtual-scroll-viewport')) {
            // eslint-disable-next-line no-console
            console.warn(
                'KbqListSelection: `draggable` is not supported inside `cdk-virtual-scroll-viewport`. The ' +
                    'indices reported by `dropped` count only the rendered options.'
            );
        }

        if (this.options.some((option) => !!option.group)) {
            // eslint-disable-next-line no-console
            console.warn(
                'KbqListSelection: `draggable` is not supported inside `kbq-optgroup`. The indices reported ' +
                    'by `dropped` are relative to the group, not to the list.'
            );
        }
    }

    /** Keeps the underlying CDK directives in sync with the resolved `draggable` state. */
    private syncDraggableState(): void {
        this.dropList.disabled = !this.draggable;
        this.options?.forEach((option) => option.syncDraggableState());
        this.changeDetectorRef.markForCheck();
    }

    private normalizeConnectedTo(): readonly (KbqListSelection | string)[] {
        const connectedTo = this.connectedTo();

        return Array.isArray(connectedTo) ? connectedTo : [connectedTo as KbqListSelection | string];
    }

    private resolveConnectedLists(): KbqListSelection[] {
        return this.normalizeConnectedTo().filter((item): item is KbqListSelection => typeof item !== 'string');
    }

    private resolveConnectedDropLists(): (CdkDropList<KbqListSelection> | string)[] {
        return this.normalizeConnectedTo().map((item) => (typeof item === 'string' ? item : item.dropList));
    }

    /**
     * Moves the active option one position with `Alt` + up/down, or into the previous/next connected
     * list with `Alt` + left/right.
     */
    private moveActiveOptionByKey(event: KeyboardEvent): void {
        const option = this.keyManager.activeItem;

        if (!option || option.disabled) {
            return;
        }

        const previousIndex = this.getOptionIndex(option);

        if ([UP_ARROW, DOWN_ARROW].includes(event.keyCode)) {
            const currentIndex = previousIndex + (event.keyCode === UP_ARROW ? -1 : 1);

            if (!this.isValidIndex(currentIndex)) {
                return;
            }

            this.emitDropped({
                option,
                previousIndex,
                currentIndex,
                previousContainer: this,
                container: this,
                event
            });

            return;
        }

        const container = this.getAdjacentList(event.keyCode === LEFT_ARROW ? 'previous' : 'next');

        if (!container) {
            return;
        }

        this.emitDropped({
            option,
            previousIndex,
            currentIndex: container.options.length,
            previousContainer: this,
            container,
            event
        });
    }

    /**
     * Target of a keyboard transfer: the first connected list for `Alt` + right, the last one for
     * `Alt` + left. Lists connected by `id` cannot be resolved and are therefore keyboard-unreachable.
     */
    private getAdjacentList(direction: 'previous' | 'next'): KbqListSelection | undefined {
        const lists = this.resolveConnectedLists().filter((list) => list.draggable);

        return direction === 'next' ? lists.at(0) : lists.at(-1);
    }

    private emitDropped(event: KbqListSelectionDroppedEvent): void {
        this.dropped.emit(event);

        // Positional state does not survive a reorder: the key manager re-syncs `activeItemIndex` from
        // `options.changes`, but `previousActiveItemIndex` (the anchor of shift-range selection) does not.
        this.keyManager.previousActiveItemIndex = this.keyManager.activeItemIndex;

        this.announceMove(event.option, event.container);
    }

    /**
     * Announces the option's new position, but only once the consumer has actually applied the move —
     * the list never reorders its own content, so nothing is announced if `dropped` is left unhandled.
     */
    private announceMove(option: KbqListOption, container: KbqListSelection): void {
        const { value } = option;
        const label = option.getLabel();

        // Tracked on the list the move is awaited on, so that a move into a connected list does not
        // cancel one still pending here. A move that is never applied leaves its subscription pending,
        // so drop the previous one first.
        container.pendingMoveSubscription?.unsubscribe();

        container.pendingMoveSubscription = container.options.changes
            .pipe(take(1), takeUntilDestroyed(container.destroyRef))
            .subscribe(() => {
                const options = container.options.toArray();
                // Reordering within a list keeps the instance; moving between lists recreates it.
                const index = options.includes(option)
                    ? options.indexOf(option)
                    : options.findIndex((item) => container.compareWith()(item.value, value));

                if (index === -1) {
                    return;
                }

                const values: Record<string, string> = {
                    label,
                    index: `${index + 1}`,
                    total: `${options.length}`
                };
                // Single pass over the template: a label that itself contains `{{ index }}` must not be
                // rescanned and consume the substitution meant for the real placeholder.
                const message = container
                    .a11yLocale()
                    .listOptionMoved.replace(/{{ (label|index|total) }}/g, (_, name: string) => values[name]);

                // Empty then re-fill on the next tick so an identical consecutive message still changes the
                // live-region text node and is re-announced (a same-string `set` would be an `Object.is`
                // no-op that assistive tech never picks up).
                container.announcement.set('');
                setTimeout(() => container.announcement.set(message));

                container.keyManager.setActiveItem(index);
            });
    }

    // View to model callback that should be called whenever the selected options change.
    private onChange: (value: any) => void = (_: any) => {};

    /**
     * Function for handling the combination Ctrl + A (select all). By default, the internal handler is used,
     * which toggles the selection of all non-disabled options.
     */
    @Input()
    get selectAllHandler() {
        return this._selectAllHandler;
    }

    set selectAllHandler(fn: (event: KeyboardEvent, list: KbqListSelection) => void) {
        if (typeof fn !== 'function') {
            throw Error('`selectAllHandler` must be a function.');
        }

        this._selectAllHandler = fn;
    }

    private _selectAllHandler(event: KeyboardEvent, list: KbqListSelection): void {
        event.preventDefault();

        const options = list.options.toArray();

        toggleSelectAll<KbqListOption>(
            {
                items: options,
                isSelectable: (option) => !option.disabled,
                isSelected: (option) => option.selected,
                setSelected: (option, selected) => option.setSelected(selected)
            },
            { allowDeselect: list.selectAllToggle() }
        );

        list.reportValueChange();

        list.onSelectAll.emit(
            new KbqListSelectAllEvent(
                list,
                options.filter((option) => !option.disabled)
            )
        );
    }

    private copyActiveOption(event: KeyboardEvent) {
        if (!this.keyManager.activeItem) return;

        const option = this.keyManager.activeItem;

        option.preventBlur = true;

        if (this.onCopy.observed) {
            this.onCopy.emit(new KbqListCopyEvent(this, option, event));
        } else {
            this.onCopyDefaultHandler();

            event.preventDefault();
        }

        option.preventBlur = false;
    }
}

@Directive({
    selector: '[kbq-list-option-caption]',
    host: {
        class: 'kbq-list-option-caption'
    }
})
export class KbqListOptionCaption {}

/**
 * Component for list-options of selection-list. Each list-option can automatically
 * generate a checkbox and can put current item into the selectionModel of selection-list
 * if the current item is selected.
 */
@Component({
    selector: 'kbq-list-option',
    imports: [
        KbqPseudoCheckbox,
        KbqActionContainer
    ],
    templateUrl: './list-option.html',
    providers: [
        { provide: KBQ_OPTION_ACTION_PARENT, useExisting: KbqListOption },
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqListOption }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-list-option',
        '[class.kbq-selected]': 'selected',
        '[class.kbq-list-option_multiple]': 'listSelection.multiple',
        '[class.kbq-list-option_draggable]': 'draggable',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-focused]': 'hasFocus',
        '[class.kbq-action-button-focused]': 'actionButton()?.active',
        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',
        '[attr.aria-keyshortcuts]': 'draggable ? listSelection.ariaKeyShortcuts : null',
        '(focusin)': 'focus()',
        '(blur)': 'blur()',
        '(click)': 'handleClick($event)',
        '(keydown)': 'onKeydown($event)'
    },
    hostDirectives: [CdkDrag],
    exportAs: 'kbqListOption',
    preserveWhitespaces: false
})
export class KbqListOption implements OnDestroy, OnInit, IFocusableOption, KbqTitleTextRef {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private changeDetector = inject(ChangeDetectorRef);
    private ngZone = inject(NgZone);
    private readonly drag = inject<CdkDrag<KbqListOptionDragData>>(CdkDrag, { host: true });
    private readonly destroyRef = inject(DestroyRef);
    listSelection = inject(KbqListSelection);
    readonly group = inject(KbqOptgroup, { optional: true });
    hasFocus: boolean = false;
    preventBlur: boolean = false;

    readonly onFocus = new Subject<KbqOptionEvent>();

    readonly onBlur = new Subject<KbqOptionEvent>();

    readonly actionButton = contentChild(KbqOptionActionComponent);

    // `KbqOptionActionComponent` reads these as directive instances through KBQ_OPTION_ACTION_PARENT,
    // so they must stay decorator queries. A signal `contentChild` would expose the query function
    // instead of the trigger, making `dropdownTrigger.dropdownClosed` undefined and throwing on `.pipe`
    // when an action button is rendered — see #DS-5079.
    @ContentChild(KbqTooltipTrigger) tooltipTrigger?: KbqTooltipTrigger;
    @ContentChild(KbqDropdownTrigger) dropdownTrigger?: KbqDropdownTrigger;
    readonly pseudoCheckbox = contentChild(KbqPseudoCheckbox);

    readonly text = viewChild.required<ElementRef>('text');
    @ViewChild('kbqTitleText', { static: false }) textElement: ElementRef;

    // Whether the label should appear before or after the checkbox. Defaults to 'after'
    readonly checkboxPosition = input<'before' | 'after'>(undefined!);

    /**
     * This is set to true after the first OnChanges cycle so we don't clear the value of `selected`
     * in the first cycle.
     */
    private inputsInitialized = false;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get value(): any {
        return this._value;
    }
    set value(newValue: any) {
        if (this.selected && newValue !== this.value && this.inputsInitialized) {
            this.selected = false;
        }

        this._value = newValue;
    }
    private _value: any;

    /** Whether list is disabled. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        const listSelectionDisabled = this.listSelection && this.listSelection.disabled;
        const groupDisabled = this.group && this.group.disabled;

        return listSelectionDisabled || groupDisabled || this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this._disabled) {
            this._disabled = value;
            this.syncDraggableState();
        }
    }

    private _disabled = false;

    /** Whether this option can be dragged. Driven by the list — options have no `draggable` input. */
    protected get draggable(): boolean {
        return this.listSelection.draggable && !this.disabled;
    }

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get showCheckbox() {
        return this._showCheckbox !== undefined ? this._showCheckbox : this.listSelection.showCheckbox;
    }

    set showCheckbox(value: any) {
        this._showCheckbox = coerceBooleanProperty(value);
    }

    private _showCheckbox: boolean;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get selected(): boolean {
        return this.listSelection.selectionModel?.isSelected(this) || false;
    }

    set selected(value: boolean) {
        if (value !== this._selected) {
            this.setSelected(value);
        }
    }

    private _selected = false;

    get tabIndex(): any {
        return this.disabled ? null : -1;
    }

    get externalPseudoCheckbox(): boolean {
        return !!this.pseudoCheckbox();
    }

    constructor() {
        this.syncDraggableState();

        // The whole row is the drag handle, so a touch drag has to lose to a scroll gesture.
        this.drag.dragStartDelay = { touch: 300, mouse: 0 };

        // Assigned lazily: referencing `this` while the host directive is still being constructed
        // would capture a half-initialized option.
        this.drag.started.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.drag.data = { option: this };
        });
    }

    /**
     * Keeps the underlying `CdkDrag` in sync with the resolved `draggable` state.
     *
     * @docs-private
     */
    syncDraggableState(): void {
        this.drag.disabled = !this.draggable;
        this.changeDetector.markForCheck();
    }

    ngOnInit() {
        const list = this.listSelection;

        if (list._value && list._value.some((value) => list.compareWith()(value, this._value))) {
            this.setSelected(true);
        }

        const wasSelected = this._selected;

        // List options that are selected at initialization can't be reported properly to the form
        // control. This is because it takes some time until the selection-list knows about all
        // available options. Also it can happen that the ControlValueAccessor has an initial value
        // that should be used instead. Deferring the value change report to the next tick ensures
        // that the form control value is not being overwritten.
        Promise.resolve().then(() => {
            if (this._selected || wasSelected) {
                this.selected = true;
                this.changeDetector.markForCheck();
            }
        });

        this.inputsInitialized = true;
    }

    ngOnDestroy(): void {
        if (this.selected) {
            // We have to delay this until the next tick in order
            // to avoid changed after checked errors.
            Promise.resolve().then(() => (this.selected = false));
        }

        this.listSelection.removeOptionFromList(this);
    }

    toggle(): void {
        this.selected = !this.selected;
    }

    getLabel() {
        const text = this.text();

        return text ? text.nativeElement.textContent : '';
    }

    setSelected(selected: boolean) {
        if (this._selected === selected || !this.listSelection.selectionModel) {
            return;
        }

        this._selected = selected;

        if (selected) {
            this.listSelection.selectionModel.select(this);
        } else {
            this.listSelection.selectionModel.deselect(this);
        }

        this.changeDetector.markForCheck();
    }

    /** @docs-private */
    getHeight(): number {
        return this.elementRef.nativeElement.getClientRects()[0]?.height ?? 0;
    }

    /** Handles click events on the list option. */
    handleClick($event: MouseEvent): void {
        if (this.disabled) {
            return;
        }

        this.listSelection.setSelectedOptionsByClick(
            this,
            hasModifierKey($event, 'shiftKey'),
            // ctrlKey is for Windows, metaKey is for MacOS
            hasModifierKey($event, 'ctrlKey', 'metaKey')
        );
    }

    onKeydown($event) {
        kbqFocusOptionActionOnTab($event, this.actionButton());
    }

    focus() {
        if (this.disabled || this.hasFocus || this.actionButton()?.hasFocus) {
            return;
        }

        this.elementRef.nativeElement.focus();

        this.onFocus.next({ option: this });

        Promise.resolve().then(() => {
            this.hasFocus = true;

            this.changeDetector.markForCheck();
        });
    }

    blur(): void {
        if (this.preventBlur) {
            return;
        }

        // When animations are enabled, Angular may end up removing the option from the DOM a little
        // earlier than usual, causing it to be blurred and throwing off the logic in the list
        // that moves focus not the next item. To work around the issue, we defer marking the option
        // as not focused until the next time the zone stabilizes.
        this.ngZone.onStable
            .asObservable()
            .pipe(take(1))
            .subscribe(() => {
                this.ngZone.run(() => {
                    this.hasFocus = false;

                    if (this.actionButton()?.hasFocus) {
                        return;
                    }

                    this.onBlur.next({ option: this });
                });
            });
    }

    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }
}

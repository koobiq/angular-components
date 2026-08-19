import { FocusMonitor } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
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
    ElementRef,
    EventEmitter,
    forwardRef,
    HostAttributeToken,
    inject,
    Input,
    input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    output,
    Provider,
    QueryList,
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
    KBQ_WINDOW,
    KbqActionContainer,
    kbqFocusOptionActionOnTab,
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
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { auditTime, startWith, switchMap, take } from 'rxjs/operators';

/** How long consecutive `window.resize` ticks are collapsed before the scroll size is recalculated. */
const RESIZE_AUDIT_TIME = 100;

export interface KbqOptionEvent<T = any> {
    option: KbqListOption<T>;
}

export const KBQ_SELECTION_LIST_VALUE_ACCESSOR: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => KbqListSelection),
    multi: true
};

export class KbqListSelectionChange<T = any> {
    constructor(
        public source: KbqListSelection<T>,
        public option: KbqListOption<T>
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

@Component({
    selector: 'kbq-list-selection',
    template: `
        <ng-content />
    `,
    styleUrls: ['./list.scss', 'list-tokens.scss'],
    providers: [KBQ_SELECTION_LIST_VALUE_ACCESSOR],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-list-selection',
        role: 'listbox',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-list-selection_horizontal]': 'horizontal()',
        '[attr.aria-multiselectable]': 'multiple',
        '[attr.aria-orientation]': 'horizontal() ? "horizontal" : null',
        '[attr.aria-disabled]': 'disabled || null',
        '[attr.tabindex]': 'tabIndex',
        '(keydown)': 'onKeyDown($event)',
        '(focus)': 'focus()',
        '(blur)': 'blur()'
    },
    exportAs: 'kbqListSelection',
    preserveWhitespaces: false
})
export class KbqListSelection<T = any> implements AfterContentInit, AfterViewInit, OnDestroy, ControlValueAccessor {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private changeDetectorRef = inject(ChangeDetectorRef);
    private clipboard = inject(Clipboard, { optional: true });
    protected readonly focusMonitor = inject(FocusMonitor);

    keyManager: FocusKeyManager<KbqListOption<T>>;

    @ContentChildren(forwardRef(() => KbqListOption), { descendants: true }) options: QueryList<KbqListOption<T>>;

    readonly onSelectAll = output<KbqListSelectAllEvent<KbqListOption<T>>>();

    /**
     * Kept as a decorator `@Output()`/`EventEmitter` on purpose: `copyActiveOption` branches on
     * `onCopy.observed` to decide between the consumer handler and the built-in clipboard copy.
     * `output()` exposes no subscriber introspection, so migrating it would silently run both
     * paths for every existing `(onCopy)` consumer. Mirrors `KbqTreeSelection.onCopy`.
     */
    @Output() readonly onCopy = new EventEmitter<KbqListCopyEvent<KbqListOption<T>>>();

    /**
     * Whether clicking an option clears the rest of the selection.
     * Stays an accessor input: the constructor turns it off for `multiple="checkbox"`, which a
     * signal `input()` cannot do (inputs are read-only from inside the component).
     */
    @Input()
    get autoSelect(): boolean {
        return this._autoSelect;
    }

    set autoSelect(value: boolean) {
        this._autoSelect = coerceBooleanProperty(value);
    }

    private _autoSelect: boolean = true;

    /**
     * Whether the last selected option can be deselected.
     * Stays an accessor input for the same reason as {@link autoSelect}.
     */
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

    multipleMode: MultipleMode | null;

    get multiple(): boolean {
        return !!this.multipleMode;
    }

    readonly horizontal = input<boolean, unknown>(false, { transform: booleanAttribute });

    /**
     * Tab index of the list.
     * Stays an accessor input: the getter is derived from {@link disabled} and the setter also
     * records the user-provided value, which the roving focus logic restores after `tabOut`.
     */
    @Input()
    get tabIndex(): number {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: number) {
        this.userTabIndex = value;
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    /**
     * Whether the list is disabled.
     * Stays an accessor input: `setDisabledState` writes it from the `ControlValueAccessor`, which a
     * signal `input()` cannot do.
     */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this.disabled) {
            this._disabled = value;
        }
    }

    private _disabled: boolean = false;

    /**
     * Function used for comparing an option against the selected value when determining which
     * options should appear as selected. The first argument is the value of an options. The second
     * one is a value from the selected value. A boolean must be returned.
     */
    readonly compareWith = input<(o1: T, o2: T) => boolean>((a1, a2) => a1 === a2);

    userTabIndex: number | null = null;

    get showCheckbox(): boolean {
        return this.multipleMode === MultipleMode.CHECKBOX;
    }

    // Emits a change event whenever the selected state of an option changes.
    readonly selectionChange = output<KbqListSelectionChange<T>>();

    selectionModel: SelectionModel<KbqListOption<T>>;

    get optionFocusChanges(): Observable<KbqOptionEvent<T>> {
        return merge(...this.options.map((option) => option.onFocus));
    }

    get optionBlurChanges(): Observable<KbqOptionEvent<T>> {
        return merge(...this.options.map((option) => option.onBlur));
    }

    _value: T[] | null;

    private readonly destroyRef = inject(DestroyRef);
    private readonly platform = inject(Platform);
    private readonly ngZone = inject(NgZone);
    private readonly window = inject(KBQ_WINDOW);

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

        this.selectionModel = new SelectionModel<KbqListOption<T>>(this.multiple);
    }

    ngAfterContentInit(): void {
        this.keyManager = new FocusKeyManager<KbqListOption<T>>(this.options)
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

        this.listenToOptionsFocus();

        this.options.changes.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.updateTabIndex();
            this.initializeSelection();
        });

        if (!this.platform.isBrowser) return;

        this.updateScrollSize();

        // `updateScrollSize` only feeds the key manager's page size — nothing rendered depends on it,
        // so the listener stays outside the zone and never schedules change detection. `auditTime`
        // collapses a resize drag into one pair of forced layout reads per interval.
        this.ngZone.runOutsideAngular(() => {
            fromEvent(this.window, 'resize')
                .pipe(auditTime(RESIZE_AUDIT_TIME), takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.updateScrollSize());
        });
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

    /** Clears the active key-manager item (unless an option is still focused) and marks the list as touched. */
    blur(): void {
        if (!this.hasFocusedOption()) {
            this.keyManager.setActiveItem(-1);
        }

        this.onTouched();
        this.changeDetectorRef.markForCheck();
    }

    /** Selects every non-disabled option and reports the new value to the `ControlValueAccessor`. */
    selectAll(): void {
        this.options.forEach((option) => option.setSelected(true));

        this.reportValueChange();
    }

    /** Deselects every option and reports the new value to the `ControlValueAccessor`. */
    deselectAll(): void {
        this.options.forEach((option) => option.setSelected(false));

        this.reportValueChange();
    }

    updateScrollSize(): void {
        if (this.horizontal() || !this.options.first) {
            return;
        }

        const optionHeight = this.options.first.getHeight();

        // `getHeight()` is 0 whenever the option is not laid out (SSR, jsdom, `display: none`);
        // dividing by it would hand the key manager a `NaN` page size.
        if (!optionHeight) {
            return;
        }

        this.keyManager.withScrollSize(Math.floor(this.getHeight() / optionHeight));
    }

    setSelectedOptionsByClick(option: KbqListOption<T>, shiftKey: boolean, ctrlKey: boolean): void {
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

    setSelectedOptionsByKey(option: KbqListOption<T>, shiftKey: boolean, ctrlKey: boolean): void {
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

        // `previousActiveItemIndex` stays -1 until the key manager has moved at least once, so a
        // shift + click before any keyboard navigation has no anchor to extend the range from.
        if (toIndex === fromIndex || !this.isValidIndex(fromIndex) || !this.isValidIndex(toIndex)) {
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
    writeValue(values: T[] | T | null): void {
        // A form control may push a bare value instead of an array; normalize it here so that
        // `_value` always matches its declared type and stays safe to iterate over.
        this._value = values == null ? null : Array.isArray(values) ? values : [values];

        if (this.options) {
            this.setOptionsFromValues(this._value ?? []);
        }
    }

    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn: (value: T[]) => void): void {
        this.onChange = fn;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    // Implemented as a part of ControlValueAccessor.
    setDisabledState(isDisabled: boolean): void {
        // `KbqListOption.disabled` reads the list through its getter, so disabling the list cascades
        // to every option without overwriting their own `disabled` inputs.
        this.disabled = isDisabled;
        this.changeDetectorRef.markForCheck();
    }

    /** Values of the currently selected options. */
    getSelectedOptionValues(): T[] {
        return this.options.filter((option) => option.selected).map((option) => option.value);
    }

    // Toggles the selected state of the currently focused option.
    toggleFocusedOption(): void {
        const focusedIndex = this.keyManager.activeItemIndex;

        if (focusedIndex != null && this.isValidIndex(focusedIndex)) {
            const focusedOption: KbqListOption<T> = this.options.toArray()[focusedIndex];

            if (focusedOption && !focusedOption.disabled && this.canDeselectLast(focusedOption)) {
                focusedOption.toggle();

                // Emit a change event because the focused option changed its state through user interaction.
                this.emitChangeEvent(focusedOption);
                this.reportValueChange();
            }
        }
    }

    /** Whether `listOption` is allowed to be deselected, given {@link noUnselectLast}. */
    canDeselectLast(listOption: KbqListOption<T>): boolean {
        return !(this.noUnselectLast && this.selectionModel.selected.length === 1 && listOption.selected);
    }

    /**
     * Rendered height of the element, or 0 when it is not laid out (SSR, jsdom, `display: none`).
     * @docs-private
     */
    getHeight(): number {
        return this.elementRef.nativeElement.getClientRects()?.[0]?.height ?? 0;
    }

    // View to model callback that should be called if the list or its options lost focus.
    onTouched: () => void = () => {};

    // Removes an option from the selection list and updates the active item.
    removeOptionFromList(option: KbqListOption<T>): void {
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
        } else if (this.horizontal() ? keyCode === RIGHT_ARROW : keyCode === DOWN_ARROW) {
            this.keyManager.setNextItemActive();
        } else if (this.horizontal() ? keyCode === LEFT_ARROW : keyCode === UP_ARROW) {
            this.keyManager.setPreviousItemActive();
        } else if (keyCode === HOME) {
            this.keyManager.setFirstItemActive();
        } else if (keyCode === END) {
            this.keyManager.setLastItemActive();
        } else if (keyCode === PAGE_UP) {
            this.keyManager.setPreviousPageItemActive();
        } else if (keyCode === PAGE_DOWN) {
            this.keyManager.setNextPageItemActive();
        } else {
            // Everything the list does not navigate on itself goes to the key manager, which is what
            // drives type-ahead. Arrow keys never reach it — the branches above own them — so the
            // manager's own orientation config cannot double-handle them.
            this.keyManager.onKeydown(event);
        }

        if (this.keyManager.activeItem && this.isNavigationKey(event)) {
            this.setSelectedOptionsByKey(
                this.keyManager.activeItem,
                hasModifierKey(event, 'shiftKey'),
                // ctrlKey is for Windows, metaKey is for MacOS
                hasModifierKey(event, 'ctrlKey', 'metaKey')
            );
        }
    }

    /** Whether the key just handled moved the active option, taking the list orientation into account. */
    private isNavigationKey(event: KeyboardEvent): boolean {
        if (this.horizontal() && [LEFT_ARROW, RIGHT_ARROW].includes(event.keyCode)) {
            return true;
        }

        return isVerticalMovement(event);
    }

    // Reports a value change to the ControlValueAccessor
    reportValueChange(): void {
        if (this.options) {
            const value = this.getSelectedOptionValues();

            this.onChange(value);
            this._value = value;
        }
    }

    // Emits a change event if the selected state of an option changed.
    emitChangeEvent(option: KbqListOption<T>): void {
        this.selectionChange.emit(new KbqListSelectionChange<T>(this, option));
    }

    private initializeSelection(): void {
        // Defer setting the value in order to avoid the "Expression
        // has changed after it was checked" errors from Angular.
        Promise.resolve().then(() => {
            if (this._value) {
                this.setOptionsFromValues(this._value);
            }
        });
    }

    protected updateTabIndex(): void {
        // Check to see if we need to update our tab index
        this._tabIndex = this.userTabIndex || (this.options.length === 0 ? -1 : 0);
    }

    private onCopyDefaultHandler(): void {
        this.clipboard?.copy(String(this.keyManager.activeItem!.value));
    }

    /**
     * Re-points the focus/blur streams at the current options every time the query list changes.
     * `switchMap` tears down the previous `merge` for us, so no manual subscription bookkeeping.
     */
    private listenToOptionsFocus(): void {
        this.options.changes
            .pipe(
                startWith(null),
                switchMap(() => this.optionFocusChanges),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((event) => {
                const index: number = this.options.toArray().indexOf(event.option);

                if (this.isValidIndex(index)) {
                    this.keyManager.updateActiveItem(index);
                }
            });

        this.options.changes
            .pipe(
                startWith(null),
                switchMap(() => this.optionBlurChanges),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => this.blur());
    }

    /** Checks whether any of the options is focused. */
    private hasFocusedOption(): boolean {
        return this.options.some((option) => option.hasFocus);
    }

    // Returns the option with the specified value.
    private getOptionByValue(value: T): KbqListOption<T> | undefined {
        const compareWith = this.compareWith();

        return this.options.find((option) => compareWith(option.value, value));
    }

    // Sets the selected options based on the specified values.
    private setOptionsFromValues(values: T[]): void {
        this.options.forEach((option) => option.setSelected(false));

        values.forEach((value) => this.getOptionByValue(value)?.setSelected(true));
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
    private getOptionIndex(option: KbqListOption<T>): number {
        return this.options.toArray().indexOf(option);
    }

    // View to model callback that should be called whenever the selected options change.
    private onChange: (value: T[]) => void = () => {};

    /**
     * Function for handling the combination Ctrl + A (select all). By default, the internal handler is used,
     * which toggles the selection of all non-disabled options.
     */
    @Input()
    get selectAllHandler(): (event: KeyboardEvent, list: KbqListSelection<T>) => void {
        return this._selectAllHandler;
    }

    set selectAllHandler(fn: (event: KeyboardEvent, list: KbqListSelection<T>) => void) {
        if (typeof fn !== 'function') {
            throw Error('`selectAllHandler` must be a function.');
        }

        this._selectAllHandler = fn;
    }

    private _selectAllHandler(event: KeyboardEvent, list: KbqListSelection<T>): void {
        event.preventDefault();

        const options = list.options.toArray();

        toggleSelectAll<KbqListOption<T>>(
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

    private copyActiveOption(event: KeyboardEvent): void {
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

/**
 * Marker directive for the secondary line of a `kbq-list-option`.
 *
 * Purely a styling hook: it adds the `kbq-list-option-caption` class the list theme keys its
 * muted caption typography and per-state colors off.
 */
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
        role: 'option',
        '[class.kbq-selected]': 'selected',
        '[class.kbq-list-option_multiple]': 'listSelection.multiple',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-focused]': 'hasFocus',
        '[class.kbq-action-button-focused]': 'actionButton()?.active',
        '[attr.aria-selected]': 'selected',
        '[attr.aria-disabled]': 'disabled || null',
        '[attr.tabindex]': 'tabIndex',
        '(focusin)': 'focus()',
        '(blur)': 'blur()',
        '(click)': 'handleClick($event)',
        '(keydown)': 'onKeydown($event)'
    },
    exportAs: 'kbqListOption',
    preserveWhitespaces: false
})
export class KbqListOption<T = any> implements OnDestroy, OnInit, IFocusableOption, KbqTitleTextRef {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private changeDetector = inject(ChangeDetectorRef);
    private ngZone = inject(NgZone);
    listSelection: KbqListSelection<T> = inject(KbqListSelection);
    readonly group = inject(KbqOptgroup, { optional: true });
    hasFocus: boolean = false;
    preventBlur: boolean = false;

    readonly onFocus = new Subject<KbqOptionEvent<T>>();

    readonly onBlur = new Subject<KbqOptionEvent<T>>();

    readonly actionButton = contentChild(KbqOptionActionComponent);

    // `KbqOptionActionComponent` reads these as directive instances through KBQ_OPTION_ACTION_PARENT,
    // so they must stay decorator queries. A signal `contentChild` would expose the query function
    // instead of the trigger, making `dropdownTrigger.dropdownClosed` undefined and throwing on `.pipe`
    // when an action button is rendered — see #DS-5079.
    @ContentChild(KbqTooltipTrigger) tooltipTrigger?: KbqTooltipTrigger;
    @ContentChild(KbqDropdownTrigger) dropdownTrigger?: KbqDropdownTrigger;
    readonly pseudoCheckbox = contentChild(KbqPseudoCheckbox);

    readonly text = viewChild.required<ElementRef>('text');

    /**
     * Not a duplicate of {@link text}: this is the `KbqTitleTextRef` property that `title.directive.ts`
     * reads through `KBQ_TITLE_TEXT_REF`. The interface is a plain `ElementRef`, so it cannot become a
     * signal query without breaking that contract — same class of constraint as #DS-5079.
     */
    @ViewChild('kbqTitleText', { static: false }) textElement: ElementRef;

    // Whether the label should appear before or after the checkbox. Defaults to 'after'
    readonly checkboxPosition = input<'before' | 'after'>(undefined!);

    /**
     * This is set to true after the first OnChanges cycle so we don't clear the value of `selected`
     * in the first cycle.
     */
    private inputsInitialized = false;

    /**
     * Value of the option, reported through the list's `ControlValueAccessor`.
     * Stays an accessor input: the setter drops the selection when the value is replaced.
     */
    @Input()
    get value(): T {
        return this._value;
    }
    set value(newValue: T) {
        if (this.selected && newValue !== this.value && this.inputsInitialized) {
            this.selected = false;
        }

        this._value = newValue;
    }
    private _value: T;

    /**
     * Whether the option is disabled.
     * Stays an accessor input: the getter also reports the disabled state inherited from the list
     * and the option group, which a signal `input()` cannot express.
     */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        const listSelectionDisabled = this.listSelection && this.listSelection.disabled;
        const groupDisabled = this.group && this.group.disabled;

        return listSelectionDisabled || groupDisabled || this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this._disabled) {
            this._disabled = value;
            this.changeDetector.markForCheck();
        }
    }

    private _disabled = false;

    /**
     * Whether the option renders a pseudo-checkbox.
     * Stays an accessor input: when unset the getter falls back to the list's own mode.
     */
    @Input()
    get showCheckbox(): boolean {
        return this._showCheckbox !== undefined ? this._showCheckbox : this.listSelection.showCheckbox;
    }

    set showCheckbox(value: BooleanInput) {
        this._showCheckbox = coerceBooleanProperty(value);
    }

    private _showCheckbox: boolean | undefined;

    /**
     * Whether the option is selected.
     * Stays an accessor input: the state lives in the list's `SelectionModel`, not on the option.
     */
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

    get tabIndex(): number | null {
        return this.disabled ? null : -1;
    }

    protected get externalPseudoCheckbox(): boolean {
        return !!this.pseudoCheckbox();
    }

    ngOnInit(): void {
        const list = this.listSelection;

        if (list._value && list._value.some((value) => list.compareWith()(this._value, value))) {
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

    /** Toggles the selected state of this option. */
    toggle(): void {
        this.selected = !this.selected;
    }

    getLabel(): string {
        const text = this.text();

        return text ? (text.nativeElement.textContent ?? '') : '';
    }

    /** Sets the selected state directly on the list's `SelectionModel`, bypassing the `selected` input setter. */
    setSelected(selected: boolean): void {
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

    /**
     * Rendered height of the element, or 0 when it is not laid out (SSR, jsdom, `display: none`).
     * @docs-private
     */
    getHeight(): number {
        return this.elementRef.nativeElement.getClientRects()?.[0]?.height ?? 0;
    }

    /** Handles click events on the list option. */
    protected handleClick($event: MouseEvent): void {
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

    /** Handles keydown events on the list option. */
    protected onKeydown($event: KeyboardEvent): void {
        kbqFocusOptionActionOnTab($event, this.actionButton());
    }

    /** Moves DOM focus to this option, unless it is disabled or already focused. */
    focus(): void {
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

    /** Marks this option as blurred once the zone stabilizes, unless {@link preventBlur} is set. */
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

    /** The option's host DOM element. */
    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }
}

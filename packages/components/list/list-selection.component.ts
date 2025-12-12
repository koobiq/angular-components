import { FocusMonitor } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterContentInit,
    AfterViewInit,
    Attribute,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    DestroyRef,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    inject,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusKeyManager, IFocusableOption } from '@koobiq/cdk/a11y';
import {
    DOWN_ARROW,
    END,
    ENTER,
    hasModifierKey,
    HOME,
    isCopy,
    isSelectAll,
    isVerticalMovement,
    LEFT_ARROW,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    SPACE,
    TAB,
    UP_ARROW
} from '@koobiq/cdk/keycodes';
import {
    KBQ_OPTION_ACTION_PARENT,
    KBQ_TITLE_TEXT_REF,
    KbqOptgroup,
    KbqOptionActionComponent,
    KbqPseudoCheckbox,
    KbqTitleTextRef,
    MultipleMode
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

@Component({
    selector: 'kbq-list-selection',
    exportAs: 'kbqListSelection',
    template: `
        <ng-content />
    `,
    styleUrls: ['./list.scss', 'list-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-list-selection',

        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',

        '(keydown)': 'onKeyDown($event)',
        '(focus)': 'focus()',
        '(blur)': 'blur()',
        '(window:resize)': 'updateScrollSize()'
    },
    providers: [KBQ_SELECTION_LIST_VALUE_ACCESSOR],
    preserveWhitespaces: false
})
export class KbqListSelection implements AfterContentInit, AfterViewInit, OnDestroy, ControlValueAccessor {
    protected readonly focusMonitor = inject(FocusMonitor);

    keyManager: FocusKeyManager<KbqListOption>;

    @ContentChildren(forwardRef(() => KbqListOption), { descendants: true }) options: QueryList<KbqListOption>;

    @Output() readonly onSelectAll = new EventEmitter<KbqListSelectAllEvent<KbqListOption>>();

    @Output() readonly onCopy = new EventEmitter<KbqListCopyEvent<KbqListOption>>();

    @Input()
    get autoSelect(): boolean {
        return this._autoSelect;
    }

    set autoSelect(value: boolean) {
        this._autoSelect = coerceBooleanProperty(value);
    }

    private _autoSelect: boolean = true;

    @Input()
    get noUnselectLast(): boolean {
        return this._noUnselectLast;
    }

    set noUnselectLast(value: boolean) {
        this._noUnselectLast = coerceBooleanProperty(value);
    }

    private _noUnselectLast: boolean = true;

    multipleMode: MultipleMode | null;

    get multiple(): boolean {
        return !!this.multipleMode;
    }

    @Input({ transform: booleanAttribute }) horizontal: boolean = false;

    @Input()
    get tabIndex(): any {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: any) {
        this.userTabIndex = value;
        this._tabIndex = value;
    }

    private _tabIndex = 0;

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
    @Input() compareWith: (o1: any, o2: any) => boolean = (a1, a2) => a1 === a2;

    userTabIndex: number | null = null;

    get showCheckbox(): boolean {
        return this.multipleMode === MultipleMode.CHECKBOX;
    }

    // Emits a change event whenever the selected state of an option changes.
    @Output() readonly selectionChange: EventEmitter<KbqListSelectionChange> =
        new EventEmitter<KbqListSelectionChange>();

    selectionModel: SelectionModel<KbqListOption>;

    get optionFocusChanges(): Observable<KbqOptionEvent> {
        return merge(...this.options.map((option) => option.onFocus));
    }

    get optionBlurChanges(): Observable<KbqOptionEvent> {
        return merge(...this.options.map((option) => option.onBlur));
    }

    _value: string[] | null;

    private readonly destroyRef = inject(DestroyRef);

    private optionFocusSubscription: Subscription | null;

    private optionBlurSubscription: Subscription | null;

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private changeDetectorRef: ChangeDetectorRef,
        @Attribute('multiple') multiple: MultipleMode,
        @Optional() private clipboard: Clipboard
    ) {
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
    }

    ngAfterContentInit(): void {
        this.keyManager = new FocusKeyManager<KbqListOption>(this.options)
            .withTypeAhead()
            .withVerticalOrientation(!this.horizontal)
            .withHorizontalOrientation(this.horizontal ? 'ltr' : null);

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

            // Check to see if we need to update our tab index
            this.updateTabIndex();
        });

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
        if (this.horizontal || !this.options.first) {
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
        const selectedOptionState = options[fromIndex].selected;

        if (toIndex === fromIndex) {
            return;
        }

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
        const element = this.elementRef.nativeElement;

        // For SSR compatibility
        if (typeof element.getClientRects !== 'function') return 0;

        return element.getClientRects()[0]?.height ?? 0;
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

        if (this.multiple && isSelectAll(event)) {
            this.selectAllOptions();
            event.preventDefault();

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

    protected updateTabIndex(): void {
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
        return this.options.find((option) => option.value === value);
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

    // View to model callback that should be called whenever the selected options change.
    private onChange: (value: any) => void = (_: any) => {};

    private selectAllOptions() {
        const optionsToSelect = this.options.filter((option) => !option.disabled);

        optionsToSelect.forEach((option) => option.setSelected(true));

        this.onSelectAll.emit(new KbqListSelectAllEvent(this, optionsToSelect));
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
    exportAs: 'kbqListOption',
    selector: 'kbq-list-option',
    templateUrl: './list-option.html',
    host: {
        class: 'kbq-list-option',

        '[class.kbq-selected]': 'selected',
        '[class.kbq-list-option_multiple]': 'listSelection.multiple',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-focused]': 'hasFocus',

        '[class.kbq-action-button-focused]': 'actionButton?.active',

        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',

        '(focusin)': 'focus()',
        '(blur)': 'blur()',
        '(click)': 'handleClick($event)',
        '(keydown)': 'onKeydown($event)'
    },
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: KBQ_OPTION_ACTION_PARENT, useExisting: KbqListOption },
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqListOption }
    ]
})
export class KbqListOption implements OnDestroy, OnInit, IFocusableOption, KbqTitleTextRef {
    hasFocus: boolean = false;
    preventBlur: boolean = false;

    readonly onFocus = new Subject<KbqOptionEvent>();

    readonly onBlur = new Subject<KbqOptionEvent>();

    @ContentChild(KbqOptionActionComponent) actionButton: KbqOptionActionComponent;
    @ContentChild(KbqTooltipTrigger) tooltipTrigger: KbqTooltipTrigger;
    @ContentChild(KbqDropdownTrigger) dropdownTrigger: KbqDropdownTrigger;
    @ContentChild(KbqPseudoCheckbox) pseudoCheckbox: KbqPseudoCheckbox;

    @ViewChild('text', { static: false }) text: ElementRef;
    @ViewChild('kbqTitleText', { static: false }) textElement: ElementRef;

    // Whether the label should appear before or after the checkbox. Defaults to 'after'
    @Input() checkboxPosition: 'before' | 'after';

    /**
     * This is set to true after the first OnChanges cycle so we don't clear the value of `selected`
     * in the first cycle.
     */
    private inputsInitialized = false;

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

    @Input()
    get showCheckbox() {
        return this._showCheckbox !== undefined ? this._showCheckbox : this.listSelection.showCheckbox;
    }

    set showCheckbox(value: any) {
        this._showCheckbox = coerceBooleanProperty(value);
    }

    private _showCheckbox: boolean;

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
        return !!this.pseudoCheckbox;
    }

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private changeDetector: ChangeDetectorRef,
        private ngZone: NgZone,
        @Inject(forwardRef(() => KbqListSelection)) public listSelection: KbqListSelection,
        @Optional() readonly group: KbqOptgroup
    ) {}

    ngOnInit() {
        const list = this.listSelection;

        if (list._value && list._value.some((value) => list.compareWith(value, this._value))) {
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
        return this.text ? this.text.nativeElement.textContent : '';
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
        const element = this.elementRef.nativeElement;

        // For SSR compatibility
        if (typeof element.getClientRects !== 'function') return 0;

        return element.getClientRects()[0]?.height ?? 0;
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
        if (!this.actionButton) {
            return;
        }

        if ($event.keyCode === TAB && !$event.shiftKey && !this.actionButton.hasFocus) {
            this.actionButton.focus();

            $event.preventDefault();
        }
    }

    focus() {
        if (this.disabled || this.hasFocus || this.actionButton?.hasFocus) {
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

                    if (this.actionButton?.hasFocus) {
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

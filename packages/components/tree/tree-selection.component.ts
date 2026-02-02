import { FocusMonitor } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterContentInit,
    AfterViewInit,
    Attribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    inject,
    Input,
    IterableDiffer,
    IterableDiffers,
    OnDestroy,
    Optional,
    Output,
    QueryList,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusKeyManager } from '@koobiq/cdk/a11y';
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
import { getKbqSelectNonArrayValueError, MultipleMode } from '@koobiq/components/core';
import { merge, Observable, Subscription } from 'rxjs';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { delay } from 'rxjs/operators';
import { FlatTreeControl } from './control/flat-tree-control';
import { KbqTreeNodeOutlet } from './outlet';
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
        KbqTreeNodeOutlet
    ],
    template: '<ng-container kbqTreeNodeOutlet />',
    styleUrls: ['./tree-selection.scss', 'tree-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqTreeSelection',
    host: {
        class: 'kbq-tree-selection',
        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',
        '(blur)': 'blur()',
        '(focus)': 'focus($event)',
        '(keydown)': 'onKeyDown($event)',
        '(window:resize)': 'updateScrollSize()'
    },
    providers: [
        KBQ_SELECTION_TREE_VALUE_ACCESSOR,
        { provide: KBQ_TREE_OPTION_PARENT_COMPONENT, useExisting: KbqTreeSelection },
        { provide: KbqTreeBase, useExisting: KbqTreeSelection }]
})
export class KbqTreeSelection
    extends KbqTreeBase<any>
    implements ControlValueAccessor, AfterContentInit, AfterViewInit, OnDestroy
{
    protected readonly focusMonitor = inject(FocusMonitor);

    renderedOptions = new QueryList<KbqTreeOption>();

    keyManager: FocusKeyManager<KbqTreeOption>;

    selectionModel: SelectionModel<SelectionModelOption>;

    resetFocusedItemOnBlur: boolean = true;

    multipleMode: MultipleMode | null = null;

    userTabIndex: number | null = null;

    // this parameter used when select has a search field
    optionShouldHoldFocusOnBlur: boolean = false;

    @ViewChild(KbqTreeNodeOutlet, { static: true }) declare nodeOutlet: KbqTreeNodeOutlet;

    @ContentChildren(KbqTreeOption) unorderedOptions: QueryList<KbqTreeOption>;

    @Input() declare treeControl: FlatTreeControl<any>;

    @Output() readonly navigationChange = new EventEmitter<KbqTreeNavigationChange<KbqTreeOption>>();

    @Output() readonly selectionChange = new EventEmitter<KbqTreeSelectionChange<KbqTreeOption>>();

    @Output() readonly onSelectAll = new EventEmitter<KbqTreeSelectAllEvent<KbqTreeOption>>();

    @Output() readonly onCopy = new EventEmitter<KbqTreeCopyEvent<KbqTreeOption>>();

    private sortedNodes: KbqTreeOption[] = [];

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

    @Input()
    get noUnselectLast(): boolean {
        return this._noUnselectLast;
    }

    set noUnselectLast(value: boolean) {
        this._noUnselectLast = coerceBooleanProperty(value);
    }

    private _noUnselectLast: boolean = true;

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

    private optionFocusSubscription: Subscription | null;

    private optionBlurSubscription: Subscription | null;

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private scheduler: AsyncScheduler,
        differs: IterableDiffers,
        changeDetectorRef: ChangeDetectorRef,
        @Attribute('multiple') multiple: MultipleMode,
        @Optional() private clipboard: Clipboard
    ) {
        super(differs, changeDetectorRef);

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
    }

    ngAfterContentInit(): void {
        this.unorderedOptions.changes.subscribe(this.updateRenderedOptions);

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
            this.selectAllOptions();
            event.preventDefault();

            return;
        } else if (isCopy(event)) {
            this.copyActiveOption(event);

            return;
        } else if (keyCode === TAB) {
            this.keyManager.tabOut.next();

            return;
        } else if (keyCode === LEFT_ARROW && this.keyManager.activeItem?.isExpandable) {
            this.treeControl.collapse(this.keyManager.activeItem.data as KbqTreeOption);

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
        } else if (this.autoSelect) {
            this.selectionModel.clear();
            this.selectionModel.toggle(option.data);

            this.emitChangeEvent(option);
        }
    }

    setSelectedOptionsByClick(option: KbqTreeOption, shiftKey: boolean, ctrlKey: boolean): void {
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
            options[toIndex].toggle();

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

    setFocusedOption(option: KbqTreeOption): void {
        this.keyManager.setActiveItem(option);
    }

    toggleFocusedOption(): void {
        const focusedOption = this.keyManager.activeItem;

        if (!focusedOption?.selectable) return;

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

    selectAllOptions(): void {
        const disabledDataNodes = this.renderedOptions.filter((option) => option.disabled).map((option) => option.data);

        const dataNodes = this.treeControl.dataNodes.filter(
            (node) => !this.treeControl.isDisabled(node) && !disabledDataNodes.includes(node)
        );

        const selectableOptions = this.renderedOptions.filter((option) => !option.disabled);
        let changedOptions: KbqTreeOption[] = selectableOptions;

        if (dataNodes.length === this.selectionModel.selected.length) {
            this.selectionModel.clear();
        } else {
            this.selectionModel.select(...dataNodes);
            changedOptions = selectableOptions.filter((option) => !option.selected);
        }

        this.selectionChange.emit(new KbqTreeSelectionChange(this, changedOptions[0], changedOptions));
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

    // eslint-disable-next-line @typescript-eslint/ban-types
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

    private getHeight(): number {
        const element = this.elementRef.nativeElement;

        // For SSR compatibility
        if (typeof element.getClientRects !== 'function') return 0;

        return element.getClientRects()[0]?.height ?? 0;
    }

    private updateTabIndex(): void {
        this._tabIndex = this.renderedOptions.length === 0 ? -1 : 0;
    }

    private updateRenderedOptions = () => {
        const orderedOptions: KbqTreeOption[] = [];

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

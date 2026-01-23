import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { AsyncPipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButton, KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqFormsModule, PopUpPlacements, PopUpSizes } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { merge, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { KbqFilterBar } from './filter-bar';
import { KbqFilterBarButton } from './filter-bar-button';
import { KbqFilter, KbqSaveFilterError, KbqSaveFilterEvent, KbqSaveFilterStatuses } from './filter-bar.types';

@Component({
    selector: 'kbq-filters',
    imports: [
        ReactiveFormsModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqDividerModule,
        KbqIcon,
        KbqTitleModule,
        KbqFormFieldModule,
        KbqInputModule,
        NgClass,
        KbqFilterBarButton,
        AsyncPipe,
        KbqTooltipTrigger,
        KbqPopoverModule,
        FormsModule,
        KbqFormsModule,
        KbqAlertModule
    ],
    templateUrl: 'filters.html',
    styleUrls: ['filters.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqFilters',
    host: {
        class: 'kbq-filters'
    }
})
export class KbqFilters implements OnInit {
    /** @docs-private */
    protected readonly elementRef = inject(ElementRef);
    /** @docs-private */
    protected readonly destroyRef = inject(DestroyRef);
    /** @docs-private */
    protected readonly focusMonitor = inject(FocusMonitor);
    /** @docs-private */
    protected readonly placements = PopUpPlacements;
    /** @docs-private */
    protected readonly styles = KbqButtonStyles;
    /** @docs-private */
    protected readonly colors = KbqComponentColors;

    /** KbqFilterBar instance */
    protected readonly filterBar = inject(KbqFilterBar);

    /** @docs-private */
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    /** @docs-private */
    @ViewChild('mainButton') protected mainButton: KbqButton;
    /** @docs-private */
    @ViewChild('saveNewFilterButton') protected saveNewFilterButton: KbqButton;
    /** @docs-private */
    @ViewChild('filterActionsButton') protected filterActionsButton: KbqButton;

    /** @docs-private */
    @ViewChild(KbqPopoverTrigger) protected popover: KbqPopoverTrigger;
    /** @docs-private */
    @ViewChild(KbqDropdownTrigger) protected dropdown: KbqDropdownTrigger;
    /** @docs-private */
    @ViewChild('filterActionsButton') protected filterActionsDropdown: KbqDropdownTrigger;

    @ViewChild('search') private search: ElementRef;
    @ViewChild('newFilterName') private newFilterName: ElementRef;
    @ViewChild('saveFilterButton') private saveFilterButton: KbqButton;

    /** control for search filter */
    searchControl: UntypedFormControl = new UntypedFormControl();
    /** filtered by search filters */
    filteredOptions: Observable<KbqFilter[]>;

    /** @docs-private */
    popoverSize = PopUpSizes.Medium;
    /** @docs-private */
    popoverOffset: number = 4;

    /** new filter name for saving */
    filterName: FormControl<string | null>;

    /** true if saving a new filter, false if saving changes in filter */
    saveNewFilter: boolean;

    showFilterSavingError: boolean = false;
    filterSavingErrorText: string;

    isSaving: boolean = false;

    @Input() filters: KbqFilter[];

    /** Event that is generated whenever the user selects a filter. */
    @Output() readonly onSelectFilter = new EventEmitter<KbqFilter>();
    /** Event that is generated whenever the user save a filter. */
    @Output() readonly onSave = new EventEmitter<KbqSaveFilterEvent>();
    /** Event that is generated whenever the user change a filter. */
    @Output() readonly onChangeFilter = new EventEmitter<KbqSaveFilterEvent>();
    /** Event that is generated whenever the user saves a filter as new.
     * @deprecated use onSave with status = newFilter. */
    @Output() readonly onSaveAsNew = new EventEmitter<KbqSaveFilterEvent>();
    /** Event that is generated whenever the user remove a filter. */
    @Output() readonly onRemoveFilter = new EventEmitter<KbqFilter>();
    /** Event that is generated whenever the user reset a filter changes. */
    @Output() readonly onResetFilterChanges = new EventEmitter<KbqFilter | null>();

    /** header of popover. Depends on the mode */
    get popoverHeader(): string {
        return this.saveNewFilter ? this.localeData.saveAsNew : this.localeData.saveChanges;
    }

    /** Component state. true if opened dropdown or popup */
    get opened(): boolean {
        return this.popover?.isOpen || this.dropdown?.opened;
    }

    /** Component state. true if opened dropdown or popup of filterActions */
    get filterActionsOpened(): boolean {
        return this.popover?.isOpen || this.filterActionsDropdown?.opened;
    }

    /** Selected filter */
    get filter(): KbqFilter | null {
        return this.filterBar.filter;
    }

    /** Component state. True if 'filters' input contains no elements. */
    get isEmpty(): boolean {
        return this.filters.length === 0;
    }

    /** localized data
     * @docs-private */
    get localeData() {
        return this.filterBar.configuration.filters;
    }

    /** Current focus origin state.
     * @docs-private */
    get focusOrigin(): FocusOrigin {
        return this._focusOrigin;
    }

    private _focusOrigin: FocusOrigin = null;

    private focusedElementBeforeOpen: KbqButton | null;

    constructor() {
        this.filterBar.changes.subscribe(() => this.changeDetectorRef.markForCheck());
    }

    ngOnInit(): void {
        this.filteredOptions = merge(
            of(this.filters),
            this.searchControl.valueChanges.pipe(map((value) => this.getFilteredOptions(value)))
        );

        this.focusMonitor
            .monitor(this.elementRef, true)
            .pipe(
                filter((origin) => !!origin),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((origin) => (this._focusOrigin = origin));
    }

    /** @docs-private */
    focusedElementBeforeIs(button: KbqButton): boolean {
        return this.focusedElementBeforeOpen === button;
    }

    selectFilter(filter: KbqFilter) {
        this.filterBar.internalFilterChanges.next(structuredClone(filter));

        this.onSelectFilter.next(filter);
    }

    saveChanges() {
        if (!this.filterBar.filter) return;

        this.filterBar.filter.saved = true;
        this.filterBar.filter.changed = false;

        this.filterBar.internalFilterChanges.next(this.filterBar.filter);

        this.onSave.emit({
            filter: this.filterBar.filter,
            filterBar: this.filterBar,
            status: KbqSaveFilterStatuses.OnlyChanges
        });
    }

    saveAsNew(event?: Event) {
        if (this.filterName.invalid) return;

        const name = this.filterName.value || '';

        // @todo default filter
        const filter = structuredClone<KbqFilter>(this.filter as KbqFilter) || { pipes: [] };

        filter.name = name;
        filter.saved = true;
        filter.changed = false;

        this.isSaving = true;
        this.popover.preventClose = true;
        this.filterName.disable();

        if (this.saveNewFilter) {
            this.onSaveAsNew.emit({ filter, filterBar: this.filterBar });
            this.onSave.emit({ filter, filterBar: this.filterBar, status: KbqSaveFilterStatuses.NewFilter });
        } else {
            this.onSave.emit({ filter, filterBar: this.filterBar, status: KbqSaveFilterStatuses.NewName });
        }

        event?.preventDefault();
    }

    showError(error?: KbqSaveFilterError) {
        if (error?.nameAlreadyExists) {
            this.filterName.setErrors({ filterNameAlreadyExist: true });
        }

        this.showFilterSavingError = true;

        this.filterSavingErrorText = error?.text ?? this.filterBar.configuration.filters.errorHint;
    }

    restoreFocus() {
        if (this.focusedElementBeforeOpen && !this.focusedElementBeforeOpen.disabled) {
            this.focusMonitor.focusVia(this.focusedElementBeforeOpen.elementRef, this.focusOrigin);
            this.focusedElementBeforeOpen = null;
        }
    }

    preparePopover() {
        this.filterName = new FormControl<string>(this.filter?.name || '', Validators.required);

        this.filterName.valueChanges.pipe(distinctUntilChanged()).subscribe(() => (this.showFilterSavingError = false));

        this.popover.show();

        merge(...this.popover.defaultClosingActions())
            .pipe(
                filter(() => !this.isSaving),
                takeUntilDestroyed(this.popover.instanceDestroyRef)
            )
            .subscribe(() => this.closePopover(false));

        this.popover.visibleChange
            .pipe(
                filter((state) => !state),
                takeUntilDestroyed(this.popover.instanceDestroyRef)
            )
            .subscribe(this.closePopover);

        setTimeout(() => {
            this.newFilterName.nativeElement.focus();
            this.filterName.setErrors(null);
        });
    }

    openSaveAsNewFilterPopover() {
        this.saveNewFilter = true;

        this.preparePopover();
    }

    openChangeFilterNamePopover() {
        this.saveNewFilter = false;

        this.preparePopover();
    }

    /** @docs-private */
    saveFocusedElement(button?: KbqButton) {
        this.focusedElementBeforeOpen = button || null;
    }

    closePopover = (restoreFocus: boolean = true) => {
        this.popover.hide();

        if (restoreFocus) this.restoreFocus();

        setTimeout(() => this.changeDetectorRef.detectChanges());

        this.showFilterSavingError = false;
    };

    /** @docs-private */
    stopEventPropagation(event: Event) {
        event.stopPropagation();
    }

    /** @docs-private */
    searchKeydownHandler(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            this.closePopover();
        } else {
            this.stopEventPropagation(event);
        }
    }

    /** @docs-private */
    onDropdownOpen() {
        this.searchControl.setValue(null);
        setTimeout(() => this.search.nativeElement.focus());
    }

    resetFilterChanges() {
        this.filterBar.resetFilterChangedState();

        this.onResetFilterChanges.emit(this.filter!);
    }

    removeFilter() {
        this.onRemoveFilter.next(this.filter!);

        setTimeout(() => this.focusMonitor.focusVia(this.mainButton.elementRef, this.focusOrigin), 0);
    }

    /** Hide the popup and restore focus.
     * Use this method in the onSave, onSaveAsNew, or onChangeFilter events after the data has been successfully saved. */
    filterSavedSuccessfully() {
        this.isSaving = false;
        this.popover.preventClose = false;

        this.popover.hide();
        setTimeout(() => this.restoreFocus(), 0);

        this.changeDetectorRef.markForCheck();
    }

    /** Shows an error. Use this method in the onSave, onSaveAsNew, or onChangeFilter events if saving data failed. */
    filterSavedUnsuccessfully(error?: KbqSaveFilterError) {
        this.isSaving = false;
        this.popover.preventClose = false;

        this.showError(error);
        this.filterName.enable();
        setTimeout(() => this.saveFilterButton.focus());

        this.changeDetectorRef.markForCheck();
    }

    private getFilteredOptions(value): KbqFilter[] {
        const searchFilter = value && value.new ? value.value : value;

        return searchFilter
            ? this.filters.filter((filter) => filter.name.toLowerCase().includes(searchFilter.toLowerCase()))
            : this.filters;
    }
}

import { AsyncPipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
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
import { filter, map } from 'rxjs/operators';
import { KbqFilterBar } from './filter-bar';
import { KbqFilterBarButton } from './filter-bar-button';
import { KbqFilter, KbqSaveFilterError, KbqSaveFilterEvent } from './filter-bar.types';

@Component({
    standalone: true,
    exportAs: 'kbqFilters',
    selector: 'kbq-filters',
    templateUrl: 'filters.html',
    styleUrls: ['filters.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-filters'
    },
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
    ]
})
export class KbqFilters implements OnInit {
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

    @ViewChild(KbqButton) private button: KbqButton;
    @ViewChild(KbqPopoverTrigger) private popover: KbqPopoverTrigger;
    @ViewChild(KbqDropdownTrigger) private dropdown: KbqDropdownTrigger;
    @ViewChild('search') private search: ElementRef;
    @ViewChild('newFilterName') private newFilterName: ElementRef;

    /** control for search filter */
    searchControl: UntypedFormControl = new UntypedFormControl();
    /** filtered by search filters */
    filteredOptions: Observable<KbqFilter[]>;

    /** @docs-private */
    popoverSize = PopUpSizes.Medium;

    /** new filter name for saving */
    filterName: FormControl<string | null>;

    /** true if saving a new filter, false if saving changes in filter */
    saveNewFilter: boolean;

    showFilterSavingError: boolean = false;
    filterSavingErrorText: string;

    @Input() filters: KbqFilter[];

    /** Event that is generated whenever the user selects a filter. */
    @Output() readonly onSelectFilter = new EventEmitter<KbqFilter>();
    /** Event that is generated whenever the user save a filter. */
    @Output() readonly onSave = new EventEmitter<KbqSaveFilterEvent>();
    /** Event that is generated whenever the user change a filter. */
    @Output() readonly onChangeFilter = new EventEmitter<KbqSaveFilterEvent>();
    /** Event that is generated whenever the user saves a filter as new. */
    @Output() readonly onSaveAsNew = new EventEmitter<KbqSaveFilterEvent>();
    /** Event that is generated whenever the user remove a filter. */
    @Output() readonly onRemoveFilter = new EventEmitter<KbqFilter>();
    /** Event that is generated whenever the user reset a filter changes. */
    @Output() readonly onResetFilterChanges = new EventEmitter<KbqFilter | null>();

    /** header of popover. Depends on the mode */
    get popoverHeader(): string {
        return this.saveNewFilter ? 'Новый фильтр' : 'Изменить фильтр';
    }

    /** Component state. true if opened dropdown or popup */
    get opened(): boolean {
        return this.popover?.isOpen || this.dropdown?.opened;
    }

    /** Selected filter */
    get filter(): KbqFilter | null {
        return this.filterBar.filter;
    }

    /** Component state. True if 'filters' input contains no elements. */
    get isEmpty(): boolean {
        return this.filters.length === 0;
    }

    constructor() {
        this.filterBar.changes.subscribe(() => this.changeDetectorRef.markForCheck());
    }

    ngOnInit(): void {
        this.filteredOptions = merge(
            of(this.filters),
            this.searchControl.valueChanges.pipe(map((value) => this.getFilteredOptions(value)))
        );
    }

    selectFilter(filter: KbqFilter) {
        this.filterBar.internalFilterChanges.next(structuredClone(filter));

        this.filterBar.saveFilterState();
        this.onSelectFilter.next(filter);
    }

    saveChanges() {
        if (!this.filterBar.filter) return;

        this.filterBar.filter.saved = true;
        this.filterBar.filter.changed = false;

        this.filterBar.saveFilterState();

        this.filterBar.internalFilterChanges.next(this.filterBar.filter);

        this.onSave.emit({ filter: this.filterBar.filter, filterBar: this.filterBar });
    }

    saveAsNew() {
        if (this.filterName.invalid) return;

        const name = this.filterName.value || '';

        if (this.saveNewFilter) {
            // @todo default filter
            const filter = structuredClone<KbqFilter>(this.filter as KbqFilter) || { pipes: [] };

            filter.name = name;
            filter.saved = true;
            filter.changed = false;

            this.onSaveAsNew.emit({ filter, filterBar: this.filterBar });
        } else {
            this.filterBar.filter!.name = name;
            this.filterBar.filter!.saved = true;
            this.filterBar.filter!.changed = false;

            this.onSave.emit({ filter: this.filterBar.filter, filterBar: this.filterBar });
        }
    }

    showError(error?: KbqSaveFilterError) {
        if (error?.nameAlreadyExists) {
            this.filterName.setErrors({ filterNameAlreadyExist: true });
        }

        this.showFilterSavingError = true;

        this.filterSavingErrorText = error?.text ?? this.filterBar.configuration.filters.errorHint;
    }

    restoreFocus() {
        this.button.focus();
    }

    preparePopover() {
        this.filterName = new FormControl<string>(this.filter?.name || '', Validators.required);

        this.filterName.valueChanges.subscribe(() => (this.showFilterSavingError = false));

        this.popover.show();

        merge(...this.popover.defaultClosingActions()).subscribe(this.closePopover);
        this.popover.visibleChange.pipe(filter((state) => !state)).subscribe(this.closePopover);

        setTimeout(() => this.newFilterName.nativeElement.focus());
    }

    openSaveAsNewFilterPopover() {
        this.saveNewFilter = true;

        this.preparePopover();
    }

    openChangeFilterNamePopover() {
        this.saveNewFilter = false;

        this.preparePopover();
    }

    closePopover = () => {
        this.popover.hide();

        this.restoreFocus();

        setTimeout(() => this.changeDetectorRef.detectChanges());
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
        setTimeout(() => this.search.nativeElement.focus());
    }

    resetFilterChanges() {
        this.filterBar.resetFilterChangedState();

        this.onResetFilterChanges.emit(this.filter!);
    }

    /** Hide the popup and restore focus.
     * Use this method in the onSave, onSaveAsNew, or onChangeFilter events after the data has been successfully saved. */
    filterSavedSuccessfully() {
        this.popover.hide();
        this.restoreFocus();
    }

    /** Shows an error. Use this method in the onSave, onSaveAsNew, or onChangeFilter events if saving data failed. */
    filterSavedUnsuccessfully(error?: KbqSaveFilterError) {
        this.showError(error);
    }

    private getFilteredOptions(value): KbqFilter[] {
        const searchFilter = value && value.new ? value.value : value;

        return searchFilter
            ? this.filters.filter((filter) => filter.name.toLowerCase().includes(searchFilter.toLowerCase()))
            : this.filters;
    }
}

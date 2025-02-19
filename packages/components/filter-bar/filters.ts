import { AsyncPipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormControl,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
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
import { KbqFilter, KbqSaveFilterError } from './filter-bar.types';

export const filterNameAlreadyExistValidator = (names: string[]): ValidatorFn => {
    return ({ value }: AbstractControl): ValidationErrors | null => {
        if (!value) {
            return null;
        }

        return names.includes(value) ? { filterNameAlreadyExist: true } : null;
    };
};

@Component({
    standalone: true,
    selector: 'kbq-filters',
    templateUrl: 'filters.html',
    styleUrls: ['filters.scss', 'filter-bar-tokens.scss'],
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
    protected readonly placements = PopUpPlacements;

    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    @ViewChild(KbqButton) button: KbqButton;
    @ViewChild(KbqPopoverTrigger) popover: KbqPopoverTrigger;
    @ViewChild(KbqDropdownTrigger) dropdown: KbqDropdownTrigger;

    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    searchControl: UntypedFormControl = new UntypedFormControl();
    filteredOptions: Observable<KbqFilter[]>;

    popoverSize = PopUpSizes.Medium;

    filterName: FormControl<string | null>;
    saveNewFilter: boolean;
    showFilterSavingError: boolean = false;
    filterSavingErrorText: string;

    get popoverHeader(): string {
        return this.saveNewFilter ? 'Новый фильтр' : 'Изменить фильтр';
    }

    @Input() filters: KbqFilter[];

    @Output() onSelectFilter = new EventEmitter<KbqFilter>();
    @Output() onSave = new EventEmitter<{ filter: KbqFilter | null; filterBar: KbqFilterBar }>();
    @Output() onSaveAsNew = new EventEmitter<{ filter: KbqFilter | null; filterBar: KbqFilterBar }>();
    @Output() onDeleteFilter = new EventEmitter<KbqFilter>();

    get opened(): boolean {
        return this.popover?.isOpen || this.dropdown?.opened;
    }

    get filter(): KbqFilter | null {
        return this.filterBar.filter;
    }

    get existFilterNames(): string[] {
        return this.filterBar.filters?.filters.map((filter) => filter.name) || [];
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
        this.filterBar.internalFilterChanges.next(filter);

        this.filterBar.saveFilterState(filter);
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

        const filter = structuredClone<KbqFilter>(this.filter as KbqFilter);

        filter.name = this.filterName.value || '';
        filter.saved = true;
        filter.changed = false;

        if (this.saveNewFilter) {
            this.onSaveAsNew.emit({ filter: filter, filterBar: this.filterBar });
        } else {
            this.onSave.emit({ filter: filter, filterBar: this.filterBar });
        }
    }

    showError(error?: KbqSaveFilterError) {
        if (error?.nameAlreadyExists) {
            console.log('need set error in control: ');
        }

        this.showFilterSavingError = true;

        this.filterSavingErrorText =
            error?.text ?? 'Не удалось сохранить фильтр. Попробуйте снова или сообщите администратору.';
    }

    restoreFocus() {
        this.button.focus();
    }

    preparePopoverData() {
        this.filterName = new FormControl<string>(this.filter?.name || '', [
            Validators.required,
            filterNameAlreadyExistValidator(this.existFilterNames)]);

        this.filterName.valueChanges.subscribe(() => (this.showFilterSavingError = false));

        this.popover.show();

        merge(...this.popover.defaultClosingActions()).subscribe(this.closePopover);
        this.popover.visibleChange.pipe(filter((state) => !state)).subscribe(this.closePopover);
    }

    openSaveAsNewFilterPopover() {
        this.saveNewFilter = true;

        this.preparePopoverData();
    }

    openChangeFilterNamePopover() {
        this.saveNewFilter = false;

        this.preparePopoverData();
    }

    closePopover = () => {
        this.popover.hide();

        this.restoreFocus();

        setTimeout(() => this.changeDetectorRef.detectChanges());
    };

    stopEventPropagation(event: MouseEvent | KeyboardEvent) {
        event.stopPropagation();
    }

    private getFilteredOptions(value): KbqFilter[] {
        const searchFilter = value && value.new ? value.value : value;

        return searchFilter
            ? this.filters.filter((filter) => filter.name.toLowerCase().includes(searchFilter.toLowerCase()))
            : this.filters;
    }
}

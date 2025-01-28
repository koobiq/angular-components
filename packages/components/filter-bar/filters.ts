import { AsyncPipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    inject, Input,
    OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { merge, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { KbqFilterBar } from './filter-bar';
import { KbqFilterBarButton } from './filter-bar-button';
import { KbqFilter } from './filter-bar.types';

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
        KbqTooltipTrigger
    ]
})
export class KbqFilters implements OnInit {
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    searchControl: UntypedFormControl = new UntypedFormControl();
    filteredOptions: Observable<KbqFilter[]>;

    @Input() filters: KbqFilter[];

    @Output() onSelectFilter = new EventEmitter<KbqFilter>();
    @Output() onSave = new EventEmitter<KbqFilter>();
    @Output() onSaveAsNew = new EventEmitter<KbqFilter>();
    @Output() onChangeFilter = new EventEmitter<KbqFilter | null>();
    @Output() onResetFilter = new EventEmitter<KbqFilter>();
    @Output() onDeleteFilter = new EventEmitter<KbqFilter>();

    get activeFilter(): KbqFilter | null {
        return this.filterBar.activeFilter;
    }

    get savedFilterChanged(): boolean {
        return !!(this.filterBar.activeFilter?.saved && this.filterBar.activeFilter?.changed);
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
        this.filterBar.activeFilterChanges.next(filter);
        this.onSelectFilter.next(filter);
    }

    save() {
        this.filterBar.saveFilterState();
        this.filterBar.resetFilterChangedState();
        this.onSave.emit(this.filterBar.activeFilter!);
    }

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

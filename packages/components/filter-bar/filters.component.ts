import { AsyncPipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    inject,
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
import { merge, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { KbqFilterBarButton } from './filter-bar-button.component';
import { KbqFilterBar } from './filter-bar.component';
import { KbqFilter } from './filter-bar.types';

@Component({
    standalone: true,
    selector: 'kbq-filters',
    templateUrl: 'filters.component.html',
    styleUrls: ['filters.component.scss', 'filter-bar-tokens.scss'],
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
        AsyncPipe
    ]
})
export class KbqFilters implements OnInit {
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    searchControl: UntypedFormControl = new UntypedFormControl();
    filteredOptions: Observable<KbqFilter[]>;

    @Output() onSelectFilter = new EventEmitter<KbqFilter>();

    get activeFilter(): KbqFilter | null {
        return this.filterBar.activeFilter;
    }

    constructor() {
        this.filterBar.activeFilterChanges.subscribe(() => {
            this.changeDetectorRef.markForCheck();
        });
    }

    ngOnInit(): void {
        this.filteredOptions = merge(
            of(this.filterBar.filters),
            this.searchControl.valueChanges.pipe(map((value) => this.getFilteredOptions(value)))
        );
    }

    selectFilter(filter: KbqFilter) {
        this.filterBar.activeFilterChanges.next(filter);
        this.onSelectFilter.next(filter);
    }

    onSave() {
        console.log('onSave: ');
    }

    onSaveAsNew() {
        console.log('onSaveAsNew: ');
    }

    onChange() {
        console.log('onChange: ');
    }

    onReset() {
        console.log('onReset: ');
    }

    onDelete() {
        console.log('onDelete: ');
    }

    stopEventPropagation(event: MouseEvent | KeyboardEvent) {
        event.stopPropagation();
    }

    private getFilteredOptions(value): KbqFilter[] {
        const searchFilter = value && value.new ? value.value : value;

        return searchFilter
            ? this.filterBar.filters.filter((filter) => filter.name.toLowerCase().includes(searchFilter.toLowerCase()))
            : this.filterBar.filters;
    }
}

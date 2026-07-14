import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import {
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSaveFilterEvent,
    KbqSaveFilterStatuses
} from '@koobiq/components/filter-bar';
import { KbqSearchExpandableModule } from '@koobiq/components/search-expandable';

/**
 * @title filter-bar-search-placement
 */
@Component({
    selector: 'filter-bar-search-placement-example',
    imports: [
        KbqButtonToggleModule,
        KbqFilterBarModule,
        KbqSearchExpandableModule,
        FormsModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-button-toggle-group
            class="layout-margin-bottom-l"
            [ngModel]="searchPlacement()"
            (ngModelChange)="searchPlacement.set($event)"
        >
            <kbq-button-toggle value="start">Leading (start)</kbq-button-toggle>
            <kbq-button-toggle value="end">Trailing (end)</kbq-button-toggle>
        </kbq-button-toggle-group>

        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [searchPlacement]="searchPlacement()" [(filter)]="activeFilter">
            <kbq-filters
                [filters]="filters"
                (onSave)="onSaveFilter($event)"
                (onResetFilterChanges)="onResetFilterChanges($event)"
                (onRemoveFilter)="onDeleteFilter($event)"
            />

            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add />

            <kbq-search-expandable [formControl]="searchControl" />
        </kbq-filter-bar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarSearchPlacementExample {
    /** Controls where the search sits inside the bar. */
    readonly searchPlacement = signal<'start' | 'end'>('end');

    readonly searchControl = new FormControl('report');

    /** Filter currently shown in the bar. Two-way bound so `kbq-pipe-add` can add pipes to it. */
    activeFilter: KbqFilter | null = null;

    filters: KbqFilter[] = [
        {
            name: 'Saved Filter 1',
            readonly: false,
            disabled: false,
            changed: false,
            saved: true,
            pipes: [
                {
                    name: 'Select',
                    value: { name: 'Option 1', id: '1' },
                    type: KbqPipeTypes.Select,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'Text',
                    value: 'Angular Rules',
                    type: KbqPipeTypes.Text,
                    cleanable: false,
                    removable: true,
                    disabled: false
                }
            ]
        },
        {
            name: 'Saved Filter 2',
            readonly: false,
            disabled: false,
            changed: false,
            saved: true,
            pipes: [
                {
                    name: 'Select',
                    value: { name: 'Option 3', id: '3' },
                    type: KbqPipeTypes.Select,
                    cleanable: false,
                    removable: true,
                    disabled: false
                }
            ]
        }
    ];
    savedFilters: KbqFilter[] = structuredClone(this.filters);

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Select',
            type: KbqPipeTypes.Select,
            values: [
                { name: 'Option 1', id: '1' },
                { name: 'Option 2', id: '2' },
                { name: 'Option 3', id: '3' }
            ],
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Text',
            type: KbqPipeTypes.Text,
            cleanable: false,
            removable: true,
            disabled: false
        }
    ];

    onResetFilterChanges(filter: KbqFilter | null) {
        const savedFilter = this.getSavedFilter(filter);

        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter?.name),
            1,
            savedFilter
        );

        this.activeFilter = savedFilter;
    }

    onDeleteFilter(filter: KbqFilter) {
        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter?.name),
            1
        );

        this.activeFilter = null;
    }

    onSaveFilter({ filter, filterBar, status }: KbqSaveFilterEvent) {
        if (status === KbqSaveFilterStatuses.NewFilter) {
            this.saveNewFilter(filter, filterBar);
        } else if (status === KbqSaveFilterStatuses.NewName) {
            this.saveCurrentFilterWithNewName(filter, filterBar);
        } else if (status === KbqSaveFilterStatuses.OnlyChanges) {
            this.saveCurrentFilterWithChangesInPipes(filter, filterBar);
        }
    }

    saveNewFilter(filter: KbqFilter, filterBar: KbqFilterBar) {
        // This logic simulates the behavior of the backend
        if (!this.filters.map(({ name }) => name).includes(filter.name)) {
            this.filters.push(filter);

            this.activeFilter = filter;

            filterBar.filters()?.filterSavedSuccessfully();
        } else {
            filterBar.filters()?.filterSavedUnsuccessfully({ nameAlreadyExists: true });
        }
    }

    saveCurrentFilterWithNewName(filter: KbqFilter, filterBar: KbqFilterBar) {
        // This logic simulates the behavior of the backend
        if (filterBar.filter()?.name !== filter.name) {
            this.filters.splice(
                this.filters.findIndex(({ name }) => name === filterBar.filter()?.name),
                1,
                filter
            );

            this.activeFilter = filter;

            filterBar.filters()?.filterSavedSuccessfully();
        } else {
            filterBar.filters()?.filterSavedUnsuccessfully({ nameAlreadyExists: true });
        }
    }

    saveCurrentFilterWithChangesInPipes(filter: KbqFilter, filterBar: KbqFilterBar) {
        // This logic simulates the behavior of the backend
        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter.name),
            1,
            filter
        );

        this.activeFilter = filter;

        filterBar.filters()?.filterSavedSuccessfully();
    }

    getSavedFilter(filter: KbqFilter | null): KbqFilter {
        return structuredClone(this.savedFilters.find(({ name }) => name === filter?.name)!);
    }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import {
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSaveFilterEvent,
    KbqSaveFilterStatuses
} from '@koobiq/components/filter-bar';

/**
 * @title filter bar
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'filter-bar-overview-example',
    imports: [
        KbqFilterBarModule,
        LuxonDateModule
    ],
    template: `
        <kbq-filter-bar
            [(filter)]="activeFilter"
            [pipeTemplates]="pipeTemplates"
            (filterChange)="onFilterChange($event)"
        >
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

            @if (activeFilter?.name !== defaultFilter?.name || activeFilter?.changed) {
                <kbq-filter-reset (onResetFilter)="onResetFilter()" />
            }

            <kbq-filter-search />
        </kbq-filter-bar>
    `
})
export class FilterBarOverviewExample {
    filters: KbqFilter[] = [
        {
            name: 'Saved Filter 1',
            readonly: false,
            disabled: false,
            changed: false,
            saved: true,
            pipes: [
                {
                    name: 'Datetime',
                    value: {
                        name: 'Последние 7 дней',
                        end: null,
                        start: { days: -7 }
                    },
                    type: KbqPipeTypes.Datetime,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Select',
                    value: { name: 'Option 6', id: '6' },
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
                    name: 'Datetime',
                    value: {
                        name: 'Последний год',
                        end: null,
                        start: { years: -1 }
                    },
                    type: KbqPipeTypes.Datetime,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'MultiSelect',
                    value: [
                        { name: 'Option 1', id: '1' },
                        { name: 'Option 3', id: '3' },
                        { name: 'Option 4', id: '4' }
                    ],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'Date',
                    value: {
                        name: 'Последние 7 дней',
                        end: null,
                        start: { days: -7 }
                    },
                    type: KbqPipeTypes.Date,

                    cleanable: false,
                    removable: true,
                    disabled: false
                }
            ]
        },
        {
            name: 'Saved Filter 3',
            readonly: false,
            disabled: false,
            changed: false,
            saved: true,
            pipes: [
                {
                    name: 'Datetime',
                    value: {
                        name: 'Последние 3 дня',
                        end: null,
                        start: { days: -3 }
                    },
                    type: KbqPipeTypes.Datetime,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Select',
                    value: { name: 'Option 5', id: '5' },
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'MultiSelect',
                    value: [
                        { name: 'Option 1', id: '1' },
                        { name: 'Option 2', id: '2' }
                    ],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: true,
                    disabled: false
                }
            ]
        }
    ];
    savedFilters: KbqFilter[] = structuredClone(this.filters);

    defaultFilter: KbqFilter | null = this.getDefaultFilter();
    activeFilter: KbqFilter | null = this.getDefaultFilter();

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Date',
            type: KbqPipeTypes.Date,
            values: [
                { name: 'Последний день', start: { days: -1 }, end: null },
                { name: 'Последние 3 дня', start: { days: -3 }, end: null },
                { name: 'Последние 7 дней', start: { days: -7 }, end: null },
                { name: 'Последние 30 дней', start: { days: -30 }, end: null },
                { name: 'Последние 90 дней', start: { days: -90 }, end: null },
                { name: 'Последний год', start: { years: -1 }, end: null }
            ],
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Datetime',
            type: KbqPipeTypes.Datetime,
            values: [
                { name: 'Последний час', start: { hours: -1 }, end: null },
                { name: 'Последние 3 часа', start: { hours: -3 }, end: null },
                { name: 'Последние 24 часа', start: { hours: -24 }, end: null },
                { name: 'Последние 3 дня', start: { days: -3 }, end: null },
                { name: 'Последние 7 дней', start: { days: -7 }, end: null },
                { name: 'Последние 30 дней', start: { days: -30 }, end: null },
                { name: 'Последние 90 дней', start: { days: -90 }, end: null },
                { name: 'Последний год', start: { years: -1 }, end: null }
            ],
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'MultiSelect',
            type: KbqPipeTypes.MultiSelect,
            values: [
                { name: 'Option 1', id: '1' },
                { name: 'Option 2', id: '2' },
                { name: 'Option 3', id: '3' },
                { name: 'Option 4', id: '4' },
                { name: 'Option 5', id: '5' },
                { name: 'Option 6', id: '6' },
                { name: 'Option 7', id: '7' }
            ],
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Select',
            type: KbqPipeTypes.Select,
            values: [
                { name: 'Option 1', id: '1' },
                { name: 'Option 2', id: '2' },
                { name: 'Option 3', id: '3' },
                { name: 'Option 4', id: '4' },
                { name: 'Option 5', id: '5' },
                { name: 'Option 6', id: '6' },
                { name: 'Option 7', id: '7' }
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

    onFilterChange(filter: KbqFilter | null) {
        console.log('onFilterChange: ', filter);
    }

    onResetFilter() {
        console.log('onResetFilter: ');
        this.activeFilter = this.getDefaultFilter();
    }

    onResetFilterChanges(filter: KbqFilter | null) {
        console.log('onResetFilterChanges: ');
        const defaultFilter = this.getSavedFilter(filter);

        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter?.name),
            1,
            defaultFilter
        );

        this.activeFilter = defaultFilter;
    }

    onDeleteFilter(filter: KbqFilter) {
        const currentFilterIndex = this.filters.findIndex(({ name }) => name === filter?.name);

        this.filters.splice(currentFilterIndex, 1);

        this.activeFilter = this.getDefaultFilter();
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

            filterBar.filters.filterSavedSuccessfully();
        } else {
            filterBar.filters.filterSavedUnsuccessfully({ nameAlreadyExists: true });
        }
    }

    saveCurrentFilterWithNewName(filter: KbqFilter, filterBar: KbqFilterBar) {
        // This logic simulates the behavior of the backend
        if (filterBar.filter?.name !== filter.name) {
            this.filters.splice(
                this.filters.findIndex(({ name }) => name === filterBar.filter?.name),
                1,
                filter!
            );

            this.activeFilter = filter;

            filterBar.filters.filterSavedSuccessfully();
        } else {
            filterBar.filters.filterSavedUnsuccessfully({ nameAlreadyExists: true });
        }
    }

    saveCurrentFilterWithChangesInPipes(filter: KbqFilter, filterBar: KbqFilterBar) {
        // This logic simulates the behavior of the backend
        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter.name),
            1,
            filter!
        );

        this.activeFilter = filter;

        filterBar.filters.filterSavedSuccessfully();
    }

    getSavedFilter(filter: KbqFilter | null): KbqFilter {
        return structuredClone(this.savedFilters.find(({ name }) => name === filter?.name)!);
    }

    getDefaultFilter(): KbqFilter {
        return {
            name: '',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'Datetime',
                    value: { name: 'Последние 24 часа', end: null, start: { hours: -24 } },
                    type: KbqPipeTypes.Datetime,

                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ]
        };
    }
}

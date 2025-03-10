import { Component } from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFilter, KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';

/**
 * @title filter bar
 */
@Component({
    standalone: true,
    selector: 'filter-bar-overview-example',
    imports: [
        KbqFilterBarModule,
        KbqLuxonDateModule
    ],
    template: `
        <kbq-filter-bar
            [(filter)]="activeFilter"
            [pipeTemplates]="pipeTemplates"
            (filterChange)="onFilterChange($event)"
            (onSave)="onSaveFilter($event)"
            (onSaveAsNew)="onSaveAsNewFilter($event)"
            (onResetFilter)="onResetFilter()"
            (onResetFilterChanges)="onResetFilterChanges($event)"
            (onDeleteFilter)="onDeleteFilter($event)"
        >
            <kbq-filters [filters]="filters" />

            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add />

            @if (activeFilter?.name !== defaultFilter?.name || activeFilter?.changed) {
                <kbq-filter-reset />
            }

            <kbq-filter-bar-search />
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
                        start: null,
                        end: { days: -7 }
                    },
                    type: KbqPipeTypes.Datetime,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Select',
                    value: { name: 'Option 6', id: '6' },
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'Text',
                    value: 'Angular Rules',
                    type: KbqPipeTypes.Text,

                    required: false,
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
                        start: null,
                        end: { years: -1 }
                    },
                    type: KbqPipeTypes.Datetime,

                    required: true,
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

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'Date',
                    value: {
                        name: 'Последние 7 дней',
                        start: null,
                        end: { days: -7 }
                    },
                    type: KbqPipeTypes.Date,

                    required: false,
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
                        start: null,
                        end: { days: -3 }
                    },
                    type: KbqPipeTypes.Datetime,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Select',
                    value: { name: 'Option 5', id: '5' },
                    type: KbqPipeTypes.Select,

                    required: false,
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

                    required: false,
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
                { name: 'Последний день', start: null, end: { days: -1 } },
                { name: 'Последние 3 дня', start: null, end: { days: -3 } },
                { name: 'Последние 7 дней', start: null, end: { days: -7 } },
                { name: 'Последние 30 дней', start: null, end: { days: -30 } },
                { name: 'Последние 90 дней', start: null, end: { days: -90 } },
                { name: 'Последний год', start: null, end: { years: -1 } }
            ],
            required: false,
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Datetime',
            type: KbqPipeTypes.Datetime,
            values: [
                { name: 'Последний час', start: null, end: { hours: -1 } },
                { name: 'Последние 3 часа', start: null, end: { hours: -3 } },
                { name: 'Последние 24 часа', start: null, end: { hours: -24 } },
                { name: 'Последние 3 дня', start: null, end: { days: -3 } },
                { name: 'Последние 7 дней', start: null, end: { days: -7 } },
                { name: 'Последние 30 дней', start: null, end: { days: -30 } },
                { name: 'Последние 90 дней', start: null, end: { days: -90 } },
                { name: 'Последний год', start: null, end: { years: -1 } }
            ],
            required: false,
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
            required: false,
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

            required: false,
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Text',
            type: KbqPipeTypes.Text,

            required: false,
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

        this.activeFilter = null;
    }

    onSaveFilter({ filter, filterBar }) {
        console.log('filter to save: ', filter);

        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter?.name),
            1,
            filter
        );

        filterBar.filterSavedSuccessfully();
    }

    onSaveAsNewFilter({ filter, filterBar }) {
        if (filter) {
            this.filters.push(filter);
        }

        this.activeFilter = filter;

        filterBar.filterSavedSuccessfully();
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
                    value: { name: 'Последние 24 часа', start: null, end: { hours: -24 } },
                    type: KbqPipeTypes.Datetime,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ]
        };
    }
}

import { Component } from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFilter, KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';

/**
 * @title filter-bar-saved-filters
 */
@Component({
    standalone: true,
    selector: 'filter-bar-saved-filters-example',
    imports: [
        KbqFilterBarModule,
        KbqLuxonDateModule
    ],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [filter]="activeFilter" (filterChange)="onFilterChange($event)">
            <kbq-filters [filters]="filters" />

            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbq-pipe="pipe" />
            }

            <kbq-pipe-add />

            <kbq-filter-reset (onReset)="onReset()" />

            <kbq-filter-bar-search />
        </kbq-filter-bar>
    `
})
export class FilterBarSavedFiltersExample {
    filters: KbqFilter[] = [
        {
            name: 'Saved Filter 1',
            readonly: false,
            disabled: false,
            changed: true,
            saved: true,
            pipes: [
                {
                    name: 'Создан',
                    value: {
                        name: 'Последний день',
                        start: null,
                        end: { days: -1 }
                    },
                    type: KbqPipeTypes.Date,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Select',
                    value: { name: 'Option 1', id: '1' },
                    type: KbqPipeTypes.Select,

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
                    name: 'Создан',
                    value: {
                        name: 'Последний день',
                        start: null,
                        end: { days: -1 }
                    },
                    type: KbqPipeTypes.Date,

                    required: true,
                    cleanable: false,
                    removable: false,
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
                    name: 'Создан',
                    value: {
                        name: 'Последние 3 дня',
                        start: null,
                        end: { days: -3 }
                    },
                    type: KbqPipeTypes.Date,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ]
        }
    ];

    activeFilter: KbqFilter | null = this.filters[0];

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
            removable: false,
            disabled: false
        },
        {
            name: 'Datetime',
            type: KbqPipeTypes.Datetime,
            values: [
                { name: 'Последний день', start: null, end: { days: -1 } },
                { name: 'Последние 3 дня', start: null, end: { days: -3 } },
                { name: 'Последние 7 дней', start: null, end: { days: -7 } },
                { name: 'Последние 30 дней', start: null, end: { days: -30 } },
                { name: 'Последние 90 дней', start: null, end: { days: -90 } },
                { name: 'Последний год', start: null, end: { years: -1 } }
            ],
            required: false,
            cleanable: true,
            removable: false,
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
                { name: 'Option 7', id: '7' },
                { name: 'Option 8', id: '8' },
                { name: 'Option 9', id: '9' },
                { name: 'Option 10', id: '10' }
            ],
            required: false,
            cleanable: false,
            removable: false,
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
                { name: 'Option 7', id: '7' },
                { name: 'Option 8', id: '8' },
                { name: 'Option 9', id: '9' },
                { name: 'Option 10', id: '10' }
            ],

            required: false,
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'Text',
            type: KbqPipeTypes.Text,

            required: false,
            cleanable: false,
            removable: false,
            disabled: false
        }
    ];

    onFilterChange(filter: KbqFilter | null) {
        this.activeFilter = filter;
    }

    onReset() {
        this.activeFilter = this.getDefaultFilter();
    }

    getDefaultFilter(): KbqFilter {
        return {
            name: 'Saved Filter 1',
            readonly: false,
            disabled: false,
            changed: false,
            saved: true,
            pipes: [
                {
                    name: 'Создан',
                    value: {
                        name: 'Последний день',
                        start: null,
                        end: { days: -1 }
                    },
                    type: KbqPipeTypes.Date,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ]
        };
    }
}

import { AfterViewInit, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import { KbqFilter, KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';
import { KbqIcon } from '@koobiq/components/icon';
import { DateTime } from 'luxon';

/**
 * @title filter-bar-complete-functions
 */
@Component({
    standalone: true,
    selector: 'filter-bar-complete-functions-example',
    imports: [
        KbqFilterBarModule,
        LuxonDateModule,
        KbqIcon
    ],
    template: `
        <kbq-filter-bar
            #filterBar
            [filter]="activeFilter"
            [pipeTemplates]="pipeTemplates"
            (filterChange)="onFilterChange($event)"
        >
            <kbq-filters
                [filters]="filters"
                (onRemoveFilter)="onDeleteFilter($event)"
                (onSave)="onSaveFilter($event)"
                (onSaveAsNew)="onSaveAsNewFilter($event)"
                (onSelectFilter)="onSelectFilter($event)"
            />

            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add (onAddPipe)="onAddPipe($event)" />

            <kbq-filter-reset (onResetFilter)="onResetFilter($event)" />

            <kbq-filter-search (onSearch)="onSearch($event)" />
        </kbq-filter-bar>

        <ng-template #optionTemplate let-option="option">
            <i [color]="option.type" kbq-icon="kbq-square_16"></i>
            {{ option.name }}
        </ng-template>
    `
})
export class FilterBarCompleteFunctionsExample implements AfterViewInit {
    protected readonly adapter = inject(DateAdapter<DateTime>);

    @ViewChild('optionTemplate') optionTemplate: TemplateRef<any>;

    filters: KbqFilter[] = [
        {
            name: 'Select',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'required',
                    // required - не может быть пустым, всегда есть дефолтное значение
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.Select,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'MultiSelect',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'required',
                    value: [
                        { name: 'Не определен', id: '1' },
                        { name: 'Легитимное действие', id: '2' }
                    ],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'required',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.MultiSelect,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'Text',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'required',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.Text,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'Date',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'required',
                    value: {
                        start: this.adapter.today(),
                        end: this.adapter.today().minus({ days: 3 })
                    },
                    type: KbqPipeTypes.Date,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    value: null,
                    type: KbqPipeTypes.Date,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: {
                        start: this.adapter.today(),
                        end: this.adapter.today().minus({ days: 3 })
                    },
                    type: KbqPipeTypes.Date,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: { name: 'Последний день', start: { days: -1 }, end: null },
                    type: KbqPipeTypes.Date,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: { name: 'Последний день', start: { days: -1 }, end: null },
                    type: KbqPipeTypes.Date,

                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'Datetime',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'required',
                    value: {
                        start: this.adapter.today(),
                        end: this.adapter.today().minus({ days: 3 })
                    },
                    type: KbqPipeTypes.Datetime,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    value: null,
                    type: KbqPipeTypes.Datetime,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: {
                        start: this.adapter.today(),
                        end: this.adapter.today().minus({ days: 3 })
                    },
                    type: KbqPipeTypes.Datetime,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: { name: 'Последний день', start: { days: -1 }, end: null },
                    type: KbqPipeTypes.Datetime,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: { name: 'Последний день', start: { days: -1 }, end: null },
                    type: KbqPipeTypes.Datetime,

                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'SAVED',
            readonly: false,
            disabled: false,
            changed: false,
            saved: true,
            pipes: [
                {
                    name: 'pipe 1',
                    value: '1',
                    type: KbqPipeTypes.Text,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: ['3'],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ]
        },
        {
            name: 'CHANGED',
            readonly: false,
            disabled: false,
            changed: true,
            saved: false,
            pipes: [
                {
                    name: 'pipe 1',
                    value: '1',
                    type: KbqPipeTypes.Text,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: ['3'],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ]
        },
        {
            name: 'SAVED/CHANGED',
            readonly: false,
            disabled: false,
            changed: true,
            saved: true,
            pipes: [
                {
                    name: 'pipe 1',
                    value: '1',
                    type: KbqPipeTypes.Text,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: ['3'],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ]
        },
        {
            name: 'READONLY',
            readonly: true,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'pipe 1',
                    value: '1',
                    type: KbqPipeTypes.Text,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: ['3'],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ]
        }
    ];
    activeFilter: KbqFilter | null;
    pipeTemplates: KbqPipeTemplate[];

    ngAfterViewInit(): void {
        this.pipeTemplates = [
            {
                name: 'Select',
                type: KbqPipeTypes.Select,
                values: [
                    { name: 'Option 1', id: '1', type: 'error' },
                    { name: 'Option 2', id: '2', type: 'warning' },
                    { name: 'Option 3', id: '3', type: 'success' },
                    { name: 'Option 4', id: '4', type: 'error' },
                    { name: 'Option 5', id: '5', type: 'warning' },
                    { name: 'Option 6', id: '6', type: 'success' },
                    { name: 'Option 7', id: '7', type: 'error' },
                    { name: 'Option 8', id: '8', type: 'warning' },
                    { name: 'Option 9', id: '9', type: 'success' },
                    { name: 'Option 10', id: '10', type: 'error' }
                ],
                valueTemplate: this.optionTemplate,

                cleanable: false,
                removable: false,
                disabled: false
            },
            {
                name: 'MultiSelect',
                type: KbqPipeTypes.MultiSelect,
                values: [
                    { name: 'Option 1', id: '1', type: 'error' },
                    { name: 'Option 2', id: '2', type: 'warning' },
                    { name: 'Option 3', id: '3', type: 'success' },
                    { name: 'Option 4', id: '4', type: 'error' },
                    { name: 'Option 5', id: '5', type: 'warning' },
                    { name: 'Option 6', id: '6', type: 'success' },
                    { name: 'Option 7', id: '7', type: 'error' },
                    { name: 'Option 8', id: '8', type: 'warning' },
                    { name: 'Option 9', id: '9', type: 'success' },
                    { name: 'Option 10', id: '10', type: 'error' }
                ],
                valueTemplate: this.optionTemplate,

                cleanable: false,
                removable: true,
                disabled: false
            },
            {
                name: 'Text',
                type: KbqPipeTypes.Text,

                cleanable: false,
                removable: false,
                disabled: false
            },
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
                removable: false,
                disabled: false
            },
            {
                name: 'Datetime',
                type: KbqPipeTypes.Datetime,
                values: [
                    { name: 'Последний день', start: { days: -1 }, end: null },
                    { name: 'Последние 3 дня', start: { days: -3 }, end: null },
                    { name: 'Последние 7 дней', start: { days: -7 }, end: null },
                    { name: 'Последние 30 дней', start: { days: -30 }, end: null },
                    { name: 'Последние 90 дней', start: { days: -90 }, end: null },
                    { name: 'Последний год', start: { years: -1 }, end: null }
                ],
                cleanable: true,
                removable: false,
                disabled: false
            }
        ];
    }

    onAddPipe(pipe: KbqPipeTemplate) {
        console.log('onAddPipe: ', pipe);
    }

    onReset(filter: KbqFilter | null) {
        console.log('onReset: ', filter);
        this.activeFilter = null;
    }

    onFilterChange(filter: KbqFilter | null) {
        console.log('onFilterChange: ');
        this.activeFilter = filter;
    }

    onSelectFilter(filter: KbqFilter) {
        console.log('onSelectFilter: ', filter);
    }

    onSaveAsNewFilter({ filter, filterBar }) {
        console.log('filter to save as new: ', filter);
        console.log('filterBar: ', filterBar);

        this.filters.push(filter);
        this.activeFilter = filter;
    }

    onSaveFilter({ filter, filterBar }) {
        console.log('filter to save: ', filter);

        this.activeFilter = filter;
        filterBar.filters.filterSavedSuccessfully();
    }

    onChangeFilter(filter: KbqFilter | null) {
        console.log('filter to change: ', filter);

        alert('Нужно что то изменить в фильтре');

        filter!.changed = true;
        this.activeFilter = filter;
    }

    onResetFilter(filter: KbqFilter | null) {
        console.log('filter to reset: ', filter);

        alert('Нужно сбросить изменения в фильтре');

        filter!.changed = false;
        this.activeFilter = filter;
    }

    onDeleteFilter(filter: KbqFilter | null) {
        console.log('filter to delete: ', filter);

        alert('Нужно удалить фильтр');

        const currentFilterIndex = this.filters.findIndex(({ name }) => name === filter?.name);

        this.filters.splice(currentFilterIndex, 1);

        this.activeFilter = null;
    }

    onSearch(value: string) {
        console.log('onSearch: ', value);
    }
}

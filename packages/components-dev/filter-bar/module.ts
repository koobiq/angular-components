import { JsonPipe } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    inject,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqButtonModule } from '@koobiq/components/button';
import { DateAdapter } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import {
    kbqBuildTree,
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes
} from '@koobiq/components/filter-bar';
import { KbqIconModule } from '@koobiq/components/icon';
import { DateTime } from 'luxon';
import { FilterBarExamplesModule } from '../../docs-examples/components/filter-bar';
import { DevLocaleSelector } from '../locale-selector';

const DEV_DATA_OBJECT = {
    'No roles': 'value 0',
    'Management and Configuration': {
        Administrator: { value: 'value 1' },
        Operator: 'value 2',
        User: 'value 3'
    },
    'MP 10': {
        Administrator: 'value 4',
        Operator: 'value 5',
        User: 'value 6'
    },
    'Knowledge Base': {
        Administrator: 'value 7',
        Operator: 'value 8',
        User: 'value 9'
    }
};

@Component({
    selector: 'dev-examples',
    imports: [FilterBarExamplesModule],
    template: `
        <filter-bar-overview-example />
        <br />
        <br />
        <filter-bar-search-in-pipes-example />
        <br />
        <br />
        <filter-bar-inactive-filter-example />
        <br />
        <br />
        <filter-bar-master-checkbox-example />
        <br />
        <br />
        <filter-bar-readonly-pipe-example />
        <br />
        <br />
        <filter-bar-readonly-pipes-example />
        <br />
        <br />
        <filter-bar-uniq-pipes-example />
        <br />
        <br />
        <filter-bar-custom-pipe-example />
        <br />
        <br />
        <filter-bar-cleanable-example />
        <br />
        <br />
        <filter-bar-removable-example />
        <br />
        <br />
        <filter-bar-required-example />
        <br />
        <br />
        <filter-bar-pipe-types-example />
        <br />
        <br />
        <filter-bar-search-example />
        <br />
        <br />
        <filter-bar-saved-filters-example />
        <br />
        <br />
        <filter-bar-complete-functions-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        KbqIconModule,
        KbqFilterBarModule,
        KbqDividerModule,
        KbqButtonModule,
        KbqLuxonDateModule,
        DevDocsExamples,
        DevLocaleSelector,
        JsonPipe
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp implements AfterViewInit {
    protected readonly adapter = inject(DateAdapter<DateTime>);

    @ViewChild('filterBar') filterBar: KbqFilterBar;
    @ViewChild('optionTemplate') optionTemplate: TemplateRef<any>;

    filters: KbqFilter[] = [
        {
            name: 'select',
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
            name: 'tree-select',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'required',
                    id: 'TreeSelect',
                    // required - не может быть пустым, всегда есть дефолтное значение
                    value: 'value 0',
                    type: KbqPipeTypes.TreeSelect,

                    search: true,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    id: 'TreeSelect',
                    type: KbqPipeTypes.TreeSelect,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    id: 'TreeSelect',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.TreeSelect,

                    search: true,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    id: 'TreeSelect',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.TreeSelect,

                    search: true,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    id: 'TreeSelect',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.TreeSelect,

                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'multi-tree-select',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'required',
                    id: 'MultiTreeSelect',
                    // required - не может быть пустым, всегда есть дефолтное значение
                    value: ['value 0'],
                    type: KbqPipeTypes.MultiTreeSelect,

                    search: true,
                    selectAll: true,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    id: 'MultiTreeSelect',
                    type: KbqPipeTypes.MultiTreeSelect,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    id: 'MultiTreeSelect',
                    value: ['value 2', 'value 3'],
                    type: KbqPipeTypes.MultiTreeSelect,

                    search: true,
                    selectAll: true,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    id: 'MultiTreeSelect',
                    value: [],
                    type: KbqPipeTypes.MultiTreeSelect,

                    search: true,
                    selectAll: true,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    id: 'MultiTreeSelect',
                    value: [],
                    type: KbqPipeTypes.MultiTreeSelect,

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
                    id: 'MultiSelect',
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
                    id: 'MultiSelect',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    id: 'MultiSelect',
                    type: KbqPipeTypes.MultiSelect,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    id: 'MultiSelect',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    id: 'MultiSelect',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    id: 'MultiSelect',
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
                    name: 'requiredrequiredrequiredrequiredrequiredrequiredrequiredrequiredrequiredrequiredrequired',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.Text,
                    value: 'valuevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevalue',

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanablecleanablecleanablecleanablecleanablecleanablecleanablecleanablecleanablecleanable',
                    value: 'valuevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevalue',
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
                        start: this.adapter.today().toISO(),
                        end: this.adapter.today().minus({ days: 3 }).toISO()
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
                        start: this.adapter.today().toISO(),
                        end: this.adapter.today().minus({ days: 3 }).toISO()
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
                        start: this.adapter.today().toISO(),
                        end: this.adapter.today().minus({ days: 3 }).toISO()
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
                        start: this.adapter.today().toISO(),
                        end: this.adapter.today().minus({ days: 3 }).toISO()
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
            name: 'SAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVED',
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
            name: 'READONLY FILTER',
            readonly: true,
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
            name: 'READONLY PIPES',
            readonly: true,
            disabled: false,
            changed: false,
            saved: true,
            pipes: [
                {
                    name: 'required',
                    value: null,
                    type: KbqPipeTypes.ReadOnly,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'required',
                    value: 'value',
                    type: KbqPipeTypes.ReadOnly,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: '1111111111111111111111111111111111111111111111111111111111111111111111111',
                    type: KbqPipeTypes.ReadOnly,

                    cleanable: false,
                    removable: true,
                    disabled: false
                }
            ]
        }
    ];
    pipeTemplates: KbqPipeTemplate[];
    defaultFilter: KbqFilter | null = this.filters[2];
    activeFilter: KbqFilter | null = this.defaultFilter;

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
                id: 'MultiSelect',
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
                name: 'TreeSelect',
                type: KbqPipeTypes.TreeSelect,
                values: kbqBuildTree(DEV_DATA_OBJECT, 0),

                cleanable: false,
                removable: false,
                disabled: false
            },
            {
                name: 'MultiTreeSelect',
                type: KbqPipeTypes.MultiTreeSelect,
                values: kbqBuildTree(DEV_DATA_OBJECT, 0),

                cleanable: false,
                removable: false,
                disabled: false
            },
            {
                name: 'mySelect',
                type: KbqPipeTypes.Select,
                id: 'mySelect',
                values: [
                    { name: 'Option 1', id: '1', type: 'error' },
                    { name: 'Option 2', id: '2', type: 'warning' },
                    { name: 'Option 3', id: '3', type: 'success' },
                    { name: 'Option 4', id: '4', type: 'error' },
                    { name: 'Option 5', id: '5', type: 'warning' }
                ],
                valueTemplate: this.optionTemplate,

                cleanable: false,
                removable: false,
                disabled: false
            },
            {
                name: 'myMultiSelect',
                type: KbqPipeTypes.MultiSelect,
                id: 'myMultiSelect',
                values: [
                    { name: 'Option 1', id: '1', type: 'error' },
                    { name: 'Option 2', id: '2', type: 'warning' },
                    { name: 'Option 3', id: '3', type: 'success' },
                    { name: 'Option 4', id: '4', type: 'error' },
                    { name: 'Option 5', id: '5', type: 'warning' }
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
                name: 'myText',
                type: KbqPipeTypes.Text,
                id: 'myText',

                cleanable: false,
                removable: false,
                disabled: false
            },
            {
                name: 'Date',
                type: KbqPipeTypes.Date,
                values: [
                    { name: 'Последний день', end: null, start: { days: -1 } },
                    { name: 'Последние 3 дня', end: null, start: { days: -3 } },
                    { name: 'Последние 7 дней', end: null, start: { days: -7 } },
                    { name: 'Последние 30 дней', end: null, start: { days: -30 } },
                    { name: 'Последние 90 дней', end: null, start: { days: -90 } },
                    { name: 'Последний год', end: null, start: { years: -1 } }
                ],
                cleanable: false,
                removable: false,
                disabled: false
            },
            {
                name: 'myDate',
                type: KbqPipeTypes.Date,
                id: 'myDate',
                values: [
                    { name: 'Последний день', end: null, start: { days: -1 } },
                    { name: 'Последние 3 дня', end: null, start: { days: -3 } },
                    { name: 'Последние 7 дней', end: null, start: { days: -7 } },
                    { name: 'Последние 30 дней', end: null, start: { days: -30 } },
                    { name: 'Последние 90 дней', end: null, start: { days: -90 } },
                    { name: 'Последний год', end: null, start: { years: -1 } }
                ],
                cleanable: false,
                removable: false,
                disabled: false
            },
            {
                name: 'Datetime',
                type: KbqPipeTypes.Datetime,
                values: [
                    { name: 'Последний день', end: null, start: { days: -1 } },
                    { name: 'Последние 3 дня', end: null, start: { days: -3 } },
                    { name: 'Последние 7 дней', end: null, start: { days: -7 } },
                    { name: 'Последние 30 дней', end: null, start: { days: -30 } },
                    { name: 'Последние 90 дней', end: null, start: { days: -90 } },
                    { name: 'Последний год', end: null, start: { years: -1 } }
                ],
                cleanable: true,
                removable: false,
                disabled: false
            },
            {
                name: 'myDatetime',
                type: KbqPipeTypes.Datetime,
                id: 'myDatetime',
                values: [
                    { name: 'Последний день', end: null, start: { days: -1 } },
                    { name: 'Последние 3 дня', end: null, start: { days: -3 } },
                    { name: 'Последние 7 дней', end: null, start: { days: -7 } },
                    { name: 'Последние 30 дней', end: null, start: { days: -30 } },
                    { name: 'Последние 90 дней', end: null, start: { days: -90 } },
                    { name: 'Последний год', end: null, start: { years: -1 } }
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

    onFilterChange(filter: KbqFilter | null) {
        console.log('onFilterChange: ', filter);
    }

    onPipeChange(pipe: KbqPipe | null) {
        console.log('onPipeChange: ', pipe);
    }

    onSelectFilter(filter: KbqFilter) {
        console.log('onSelectFilter: ', filter);

        this.activeFilter = filter;
    }

    onSaveAsNewFilter({ filter, filterBar }) {
        this.filters.push(filter);

        filterBar.filters.filterSavedSuccessfully();
        // filterBar.filters.filterSavedUnsuccessfully({ nameAlreadyExists: true, text: 'custom error text' });
    }

    onSaveFilter({ filter, filterBar }) {
        console.log('filter to save: ', filter);

        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter?.name),
            1,
            filter
        );

        filterBar.filters.filterSavedSuccessfully();
    }

    onChangeFilter({ filter, filterBar }) {
        console.log('filter to save: ', filter);

        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter?.name),
            1,
            filter
        );

        filterBar.filters.filterSavedSuccessfully();
    }

    onResetFilter(filter: KbqFilter | null) {
        this.activeFilter = this.defaultFilter;
        console.log('onResetFilter: ', filter);
    }

    onResetFilterChanges(filter: KbqFilter | null) {
        console.log('onResetFilterChanges: ', filter);
    }

    onDeleteFilter(filter: KbqFilter | null) {
        console.log('filter to delete: ', filter);

        alert('Нужно удалить фильтр');

        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter?.name),
            1
        );

        this.activeFilter = null;
    }

    onSearch(value: string) {
        console.log('onSearch: ', value);
    }

    onClosePipe($event: KbqPipe) {
        console.log('onClosePipe: ', $event);
    }
}

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    NgModule,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqButtonModule } from '@koobiq/components/button';
import { DateAdapter } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import {
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqPipeTemplate,
    KbqPipeTypes
} from '@koobiq/components/filter-bar';
import { KbqIconModule } from '@koobiq/components/icon';
import { DateTime } from 'luxon';
import { FilterBarExamplesModule } from '../../docs-examples/components/filter-bar';

@Component({
    standalone: true,
    imports: [FilterBarExamplesModule],
    selector: 'dev-docs-examples',
    template: `
        <filter-bar-overview-example />
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
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent implements AfterViewInit {
    protected readonly adapter = inject(DateAdapter<DateTime>);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    @ViewChild('filterBar') filterBar: KbqFilterBar;
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

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.Select,
                    value: null,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    required: true,
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

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'required',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.MultiSelect,
                    value: null,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    required: true,
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

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.Text,
                    value: 'valuevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevalue',

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanablecleanablecleanablecleanablecleanablecleanablecleanablecleanablecleanablecleanable',
                    value: 'valuevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevalue',
                    type: KbqPipeTypes.Text,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    required: false,
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

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    value: null,
                    type: KbqPipeTypes.Date,

                    required: false,
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

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: { name: 'Последний день', start: { days: -1 }, end: null },
                    type: KbqPipeTypes.Date,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: { name: 'Последний день', start: { days: -1 }, end: null },
                    type: KbqPipeTypes.Date,

                    required: true,
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

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    value: null,
                    type: KbqPipeTypes.Datetime,

                    required: false,
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

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: { name: 'Последний день', start: { days: -1 }, end: null },
                    type: KbqPipeTypes.Datetime,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: { name: 'Последний день', start: { days: -1 }, end: null },
                    type: KbqPipeTypes.Datetime,

                    required: true,
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

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: ['3'],
                    type: KbqPipeTypes.MultiSelect,

                    required: false,
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

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: ['3'],
                    type: KbqPipeTypes.MultiSelect,

                    required: false,
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

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: ['3'],
                    type: KbqPipeTypes.MultiSelect,

                    required: false,
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
            saved: true,
            pipes: [
                {
                    name: 'pipe 1',
                    value: '1',
                    type: KbqPipeTypes.Text,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: ['3'],
                    type: KbqPipeTypes.MultiSelect,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ]
        }
    ];
    pipeTemplates: KbqPipeTemplate[];
    defaultFilter: KbqFilter | null = {
        name: '',
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

                required: true,
                cleanable: false,
                removable: false,
                disabled: false
            }
        ]
    };
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
                search: true,

                required: false,
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
                search: true,

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
                required: false,
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
                required: false,
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
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        KbqIconModule,
        KbqFilterBarModule,
        KbqDividerModule,
        KbqButtonModule,
        KbqLuxonDateModule,
        DevDocsExamples
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}

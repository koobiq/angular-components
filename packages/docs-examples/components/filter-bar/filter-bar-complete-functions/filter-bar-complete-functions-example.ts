import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    signal,
    TemplateRef,
    viewChild
} from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter } from '@koobiq/components/core';
import {
    KbqFilter,
    KbqFilterBarModule,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSaveFilterEvent
} from '@koobiq/components/filter-bar';
import { KbqIcon } from '@koobiq/components/icon';
import { DateTime } from 'luxon';
import { injectLocalizedPeriods, injectLocalizedText } from '../localized-data';

/** Text search is the first pipe in every filter: always present, never removable. */
const createSearchPipe = (name: string): KbqPipe => ({
    name,
    type: KbqPipeTypes.Input,
    value: null,

    cleanable: true,
    removable: false,
    disabled: false
});

/** The filled pipes the filter-state filters (SAVED, CHANGED, READONLY, ...) all share. */
const createNumberedPipes = (): KbqPipe[] => [
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
];

/**
 * @title filter-bar-complete-functions
 */
@Component({
    selector: 'filter-bar-complete-functions-example',
    imports: [
        KbqFilterBarModule,
        LuxonDateModule,
        KbqIcon
    ],
    template: `
        <kbq-filter-bar
            #filterBar
            [filter]="activeFilter()"
            [pipeTemplates]="pipeTemplates()"
            (filterChange)="onFilterChange($event)"
        >
            <kbq-filters
                [filters]="filters()"
                (onRemoveFilter)="onDeleteFilter($event)"
                (onSave)="onSaveFilter($event)"
                (onSelectFilter)="onSelectFilter($event)"
            />

            @for (pipe of activeFilter()?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add (onAddPipe)="onAddPipe($event)" />

            <kbq-filter-reset (onResetFilter)="onResetFilter($event)" />
        </kbq-filter-bar>

        <ng-template #optionTemplate let-option="option">
            <i kbq-icon="kbq-square_16" [color]="option.type"></i>
            {{ option.name }}
        </ng-template>
    `,
    providers: [DateFormatter],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarCompleteFunctionsExample {
    protected readonly adapter = inject(DateAdapter<DateTime>);

    /** Period labels follow the active locale, so everything built out of them is rebuilt with it. */
    protected readonly periods = injectLocalizedPeriods();

    /** Text the example owns: it has no counterpart in the library's locale data. */
    protected readonly text = injectLocalizedText({
        'ru-RU': {
            search: 'Поиск',
            undefinedOption: 'Не определен',
            legitimateAction: 'Легитимное действие',
            changeAlert: 'Нужно что то изменить в фильтре',
            resetAlert: 'Нужно сбросить изменения в фильтре',
            deleteAlert: 'Нужно удалить фильтр'
        },
        default: {
            search: 'Search',
            undefinedOption: 'Undefined',
            legitimateAction: 'Legitimate action',
            changeAlert: 'Something has to change in the filter',
            resetAlert: 'The filter changes have to be reset',
            deleteAlert: 'The filter has to be deleted'
        }
    });

    // Read as a signal, not resolved in `ngAfterViewInit`: the templates below are rebuilt whenever the
    // locale changes, so they have to be able to pick the query up on any pass, not only the first.
    readonly optionTemplate = viewChild<TemplateRef<any>>('optionTemplate');

    readonly filters = signal<KbqFilter[]>(this.createFilters());
    readonly activeFilter = signal<KbqFilter | null>(null);

    readonly pipeTemplates = computed<KbqPipeTemplate[]>(() => [
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
            valueTemplate: this.optionTemplate(),

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
            valueTemplate: this.optionTemplate(),

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
            values: this.periods.date(),
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'Datetime',
            type: KbqPipeTypes.Datetime,
            values: this.periods.date(),
            cleanable: true,
            removable: false,
            disabled: false
        }
    ]);

    constructor() {
        // A pipe component is built once from the object it is handed and never re-reads it, so
        // relabelled pipes have to arrive as new objects for `*kbqPipe` to rebuild them.
        effect(() => {
            this.filters.set(this.createFilters());
            this.activeFilter.set(null);
        });
    }

    onAddPipe(pipe: KbqPipeTemplate) {
        console.log('onAddPipe: ', pipe);
    }

    onReset(filter: KbqFilter | null) {
        console.log('onReset: ', filter);
        this.activeFilter.set(null);
    }

    onFilterChange(filter: KbqFilter | null) {
        console.log('onFilterChange: ');
        this.activeFilter.set(filter);
    }

    onSelectFilter(filter: KbqFilter) {
        console.log('onSelectFilter: ', filter);
    }

    onSaveFilter({ filter, filterBar, status }: KbqSaveFilterEvent) {
        console.log('filter to save: ', filter);

        if (status === 'newFilter') {
            this.filters.update((filters) => [...filters, filter]);
        }

        this.activeFilter.set(filter);
        filterBar.filters()?.filterSavedSuccessfully();
    }

    onChangeFilter(filter: KbqFilter | null) {
        console.log('filter to change: ', filter);

        alert(this.text().changeAlert);

        filter!.changed = true;
        this.activeFilter.set(filter);
    }

    onResetFilter(filter: KbqFilter | null) {
        console.log('filter to reset: ', filter);

        alert(this.text().resetAlert);

        filter!.changed = false;
        this.activeFilter.set(filter);
    }

    onDeleteFilter(filter: KbqFilter | null) {
        console.log('filter to delete: ', filter);

        alert(this.text().deleteAlert);

        this.filters.update((filters) => filters.filter(({ name }) => name !== filter?.name));

        this.activeFilter.set(null);
    }

    createFilters(): KbqFilter[] {
        const { search, undefinedOption, legitimateAction } = this.text();
        const undefinedValue = { name: undefinedOption, id: '1' };
        // Both date templates below offer the `date` period set, so both pipes take their value from it.
        const lastDay = this.periods.pick(this.periods.date(), { unit: 'days', amount: -1 });

        return [
            {
                name: 'Select',
                readonly: false,
                disabled: false,
                changed: false,
                saved: false,
                pipes: [
                    createSearchPipe(search),
                    {
                        name: 'required',
                        // required - cannot be empty, always carries a default value
                        value: undefinedValue,
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
                        value: undefinedValue,
                        type: KbqPipeTypes.Select,

                        cleanable: true,
                        removable: false,
                        disabled: false
                    },
                    {
                        name: 'removable',
                        value: undefinedValue,
                        type: KbqPipeTypes.Select,

                        cleanable: false,
                        removable: true,
                        disabled: false
                    },
                    {
                        name: 'disabled',
                        value: undefinedValue,
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
                    createSearchPipe(search),
                    {
                        name: 'required',
                        value: [undefinedValue, { name: legitimateAction, id: '2' }],
                        type: KbqPipeTypes.MultiSelect,

                        cleanable: false,
                        removable: false,
                        disabled: false
                    },
                    {
                        name: 'required',
                        value: [undefinedValue],
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
                        value: [undefinedValue],
                        type: KbqPipeTypes.MultiSelect,

                        cleanable: true,
                        removable: false,
                        disabled: false
                    },
                    {
                        name: 'removable',
                        value: [undefinedValue],
                        type: KbqPipeTypes.MultiSelect,

                        cleanable: false,
                        removable: true,
                        disabled: false
                    },
                    {
                        name: 'disabled',
                        value: [undefinedValue],
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
                    createSearchPipe(search),
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
                    createSearchPipe(search),
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
                        value: lastDay,
                        type: KbqPipeTypes.Date,

                        cleanable: false,
                        removable: true,
                        disabled: false
                    },
                    {
                        name: 'disabled',
                        value: lastDay,
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
                    createSearchPipe(search),
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
                        value: lastDay,
                        type: KbqPipeTypes.Datetime,

                        cleanable: false,
                        removable: true,
                        disabled: false
                    },
                    {
                        name: 'disabled',
                        value: lastDay,
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
                pipes: [createSearchPipe(search), ...createNumberedPipes()]
            },
            {
                name: 'CHANGED',
                readonly: false,
                disabled: false,
                changed: true,
                saved: false,
                pipes: [createSearchPipe(search), ...createNumberedPipes()]
            },
            {
                name: 'SAVED/CHANGED',
                readonly: false,
                disabled: false,
                changed: true,
                saved: true,
                pipes: [createSearchPipe(search), ...createNumberedPipes()]
            },
            {
                name: 'READONLY',
                readonly: true,
                disabled: false,
                changed: false,
                saved: false,
                pipes: [createSearchPipe(search), ...createNumberedPipes()]
            }
        ];
    }
}

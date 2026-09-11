import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateFormatter } from '@koobiq/components/core';
import {
    kbqBuildTree,
    KbqFilter,
    KbqFilterBarModule,
    KbqPipeTemplate,
    KbqPipeTypes
} from '@koobiq/components/filter-bar';
import { injectLocalizedPeriods } from '../localized-data';

const DATA_OBJECT = {
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

/**
 * @title filter-bar-pipe-types
 */
@Component({
    selector: 'filter-bar-pipe-types-example',
    imports: [
        KbqFilterBarModule,
        LuxonDateModule
    ],
    template: `
        <kbq-filter-bar
            [pipeTemplates]="pipeTemplates()"
            [(filter)]="activeFilter"
            (onChangePipe)="onChangePipe($event)"
        >
            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            @if (isFilterChanged) {
                <kbq-filter-reset (onResetFilter)="onResetFilter()" />
            }
        </kbq-filter-bar>
    `,
    providers: [DateFormatter],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarPipeTypesExample {
    activeFilter: KbqFilter | null = this.getDefaultFilter();

    /** Period labels follow the active locale, so the templates are rebuilt whenever it changes. */
    protected readonly periods = injectLocalizedPeriods();

    readonly pipeTemplates = computed<KbqPipeTemplate[]>(() => [
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
            values: this.periods.datetime(),
            cleanable: true,
            removable: false,
            disabled: false
        },
        {
            name: 'MultiSelect',
            type: KbqPipeTypes.MultiSelect,
            values: [
                { name: 'Option 1', value: 'value1' },
                { name: 'Option 2', value: 'value2' },
                { name: 'Option 3', value: 'value3' },
                { name: 'Option 4', value: 'value4' },
                { name: 'Option 5', value: 'value5' },
                { name: 'Option 6', value: 'value6' },
                { name: 'Option 7', value: 'value7' }
            ],
            // Same rationale as the Select template below: options are identified by `value` rather than
            // a synthetic `id`, so a custom `compareWith` is needed instead of the default id-based one.
            compareWith: (o1, o2) => !!o1 && !!o2 && o1.value === o2.value,
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'Select',
            type: KbqPipeTypes.Select,
            values: [
                { name: 'Option 1', value: 'value1' },
                { name: 'Option 2', value: 'value2' },
                { name: 'Option 3', value: 'value3' },
                { name: 'Option 4', value: 'value4' },
                { name: 'Option 5', value: 'value5' },
                { name: 'Option 6', value: 'value6' },
                { name: 'Option 7', value: 'value7' }
            ],
            // Options are identified by their business `value` rather than a synthetic `id`. Override
            // `compareWith` whenever a selected value can be a distinct object equal only by that key
            // (e.g. one restored from a saved filter) instead of the same reference. A custom comparator
            // is responsible for its own null handling — unlike the default, which never matches null.
            compareWith: (o1, o2) => !!o1 && !!o2 && o1.value === o2.value,
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'TreeSelect',
            type: KbqPipeTypes.TreeSelect,
            values: kbqBuildTree(DATA_OBJECT, 0),

            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'MultiTreeSelect',
            type: KbqPipeTypes.MultiTreeSelect,
            values: kbqBuildTree(DATA_OBJECT, 0),

            cleanable: false,
            removable: false,
            disabled: false
        }
    ]);

    get isFilterChanged(): boolean {
        return JSON.stringify(this.activeFilter?.pipes ?? []) !== JSON.stringify(this.getDefaultFilter().pipes);
    }

    onResetFilter() {
        console.log('onResetFilter: ');
        this.activeFilter = this.getDefaultFilter();
    }

    onChangePipe($event) {
        console.log('onChangePipe: ', $event);
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
                    name: 'Input',
                    type: KbqPipeTypes.Input,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Select',
                    type: KbqPipeTypes.Select,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'MultiSelect',
                    type: KbqPipeTypes.MultiSelect,
                    value: [],

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'TreeSelect',
                    type: KbqPipeTypes.TreeSelect,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'TreeSelect Multiple',
                    id: 'MultiTreeSelect',
                    type: KbqPipeTypes.MultiTreeSelect,
                    value: [],

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Text',
                    type: KbqPipeTypes.Text,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Date',
                    type: KbqPipeTypes.Date,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Datetime',
                    type: KbqPipeTypes.Datetime,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                }
            ]
        };
    }
}

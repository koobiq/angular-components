import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import {
    kbqBuildTree,
    KbqFilter,
    KbqFilterBarModule,
    KbqPipeTemplate,
    KbqPipeTypes
} from '@koobiq/components/filter-bar';

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'filter-bar-pipe-types-example',
    imports: [
        KbqFilterBarModule,
        LuxonDateModule
    ],
    template: `
        <kbq-filter-bar [filter]="activeFilter" [pipeTemplates]="pipeTemplates" (onChangePipe)="onChangePipe($event)">
            @for (pipe of activeFilter.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            @if (isFilterChanged) {
                <kbq-filter-reset (onResetFilter)="onResetFilter()" />
            }
        </kbq-filter-bar>
    `
})
export class FilterBarPipeTypesExample {
    activeFilter: KbqFilter = this.getDefaultFilter();

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
            removable: false,
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
                { name: 'Option 7', id: '7' }
            ],
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
                { name: 'Option 7', id: '7' }
            ],

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
    ];

    get isFilterChanged(): boolean {
        return JSON.stringify(this.activeFilter.pipes) !== JSON.stringify(this.getDefaultFilter().pipes);
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

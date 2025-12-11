import { AfterViewInit, ChangeDetectionStrategy, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { DateAdapter } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { DateTime } from 'luxon';
import { KbqFilterBarModule } from './filter-bar.module';
import { kbqBuildTree, KbqFilter, KbqPipeTemplate, KbqPipeTypes } from './filter-bar.types';

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
    selector: 'e2e-filter-bar-states',
    imports: [KbqFilterBarModule, KbqIcon],
    template: `
        <div data-testid="e2eScreenshotTarget">
            <kbq-filter-bar [pipeTemplates]="pipeTemplates" [filter]="filters[0]">
                @for (pipe of filters[0]?.pipes; track pipe) {
                    <ng-container *kbqPipe="pipe" />
                }

                <kbq-pipe-add />

                <kbq-filter-reset />
            </kbq-filter-bar>
            <br />
            <kbq-filter-bar [pipeTemplates]="pipeTemplates" [selectedAllEqualsSelectedNothing]="false">
                @for (pipe of filters[1]?.pipes; track pipe) {
                    <ng-container *kbqPipe="pipe" />
                }

                <kbq-pipe-add />

                <kbq-filter-reset />
            </kbq-filter-bar>
            <br />
            <kbq-filter-bar [pipeTemplates]="pipeTemplates" [filter]="filters[2]">
                @for (pipe of filters[2]?.pipes; track pipe) {
                    <ng-container *kbqPipe="pipe" />
                }

                <kbq-pipe-add />

                <kbq-filter-reset />
            </kbq-filter-bar>
            <br />
            <kbq-filter-bar [pipeTemplates]="pipeTemplates" [filter]="filters[3]">
                @for (pipe of filters[3]?.pipes; track pipe) {
                    <ng-container *kbqPipe="pipe" />
                }

                <kbq-pipe-add />

                <kbq-filter-reset />
            </kbq-filter-bar>
            <br />
            <kbq-filter-bar [pipeTemplates]="pipeTemplates" [filter]="filters[4]">
                @for (pipe of filters[4]?.pipes; track pipe) {
                    <ng-container *kbqPipe="pipe" />
                }

                <kbq-pipe-add />

                <kbq-filter-reset />
            </kbq-filter-bar>
            <br />
            <kbq-filter-bar
                [pipeTemplates]="pipeTemplates"
                [filter]="filters[5]"
                [selectedAllEqualsSelectedNothing]="false"
            >
                @for (pipe of filters[5]?.pipes; track pipe) {
                    <ng-container *kbqPipe="pipe" />
                }

                <kbq-pipe-add />

                <kbq-filter-reset />
            </kbq-filter-bar>
            <br />
            <kbq-filter-bar [pipeTemplates]="pipeTemplates" [filter]="filters[6]">
                @for (pipe of filters[6]?.pipes; track pipe) {
                    <ng-container *kbqPipe="pipe" />
                }

                <kbq-pipe-add />

                <kbq-filter-reset />
            </kbq-filter-bar>
        </div>

        <ng-template #optionTemplate let-option="option">
            <i kbq-icon="kbq-square_16" [color]="option.type"></i>
            {{ option.name }}
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eFilterBarStates'
    }
})
export class E2eFilterBarStates implements AfterViewInit {
    readonly adapter = inject(DateAdapter<DateTime>);

    @ViewChild('optionTemplate') optionTemplate: TemplateRef<any>;

    pipeTemplates: KbqPipeTemplate[];

    dateTime = this.adapter.createDateTime(2025, 11, 12, 10, 10, 10, 10);

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
                    id: 'E2ESelect',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    id: 'E2ESelect',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable empty',
                    id: 'E2ESelect',
                    value: null,
                    type: KbqPipeTypes.Select,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    id: 'E2ESelect',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'removable empty',
                    id: 'E2ESelect',
                    value: null,
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    id: 'E2ESelect',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: false,
                    disabled: true
                },
                {
                    name: 'disabled empty',
                    id: 'E2ESelect',
                    value: null,
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'multiSelect',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'required',
                    id: 'E2EMultiSelect',
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
                    name: 'cleanable',
                    id: 'E2EMultiSelect',
                    value: [
                        { name: 'Не определен', id: '1' },
                        { name: 'Легитимное действие', id: '2' }
                    ],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable empty',
                    id: 'E2EMultiSelect',
                    value: null,
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    id: 'E2EMultiSelect',
                    value: [
                        { name: 'Не определен', id: '1' },
                        { name: 'Легитимное действие', id: '2' }
                    ],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'removable empty',
                    id: 'E2EMultiSelect',
                    value: null,
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    id: 'E2EMultiSelect',
                    value: [
                        { name: 'Не определен', id: '1' },
                        { name: 'Легитимное действие', id: '2' }
                    ],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: false,
                    disabled: true
                },
                {
                    name: 'disabled empty',
                    id: 'E2EMultiSelect',
                    value: null,
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'text',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'long-name,long-name,long-name,long-name,long-name,long-name,long-name,long-name,long-name',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'name',
                    type: KbqPipeTypes.Text,
                    value: 'long-value,long-value,long-value,long-value,long-value,long-value,long-value,long-value,',

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'long-name,long-name,long-name,long-name,long-name,long-name,long-name,long-name,long-name',
                    value: 'long-value,long-value,long-value,long-value,long-value,long-value,long-value,long-value,',
                    type: KbqPipeTypes.Text,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: 'value,',
                    type: KbqPipeTypes.Text,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable empty',
                    value: null,
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
                    name: 'removable empty',
                    value: null,
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
                },
                {
                    name: 'disabled empty',
                    value: null,
                    type: KbqPipeTypes.Text,

                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'date',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'required',
                    value: {
                        start: this.dateTime,
                        end: this.dateTime.minus({ days: 3 }).toISO()
                    },
                    type: KbqPipeTypes.Date,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: {
                        start: this.dateTime.toISO(),
                        end: this.dateTime.minus({ days: 3 }).toISO()
                    },
                    type: KbqPipeTypes.Date,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable empty',
                    value: null,
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
                    name: 'removable empty',
                    value: null,
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
                },
                {
                    name: 'disabled empty',
                    value: null,
                    type: KbqPipeTypes.Date,

                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'datetime',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'required',
                    value: {
                        start: this.dateTime.toISO(),
                        end: this.dateTime.minus({ days: 3 }).toISO()
                    },
                    type: KbqPipeTypes.Datetime,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: {
                        start: this.dateTime.toISO(),
                        end: this.dateTime.minus({ days: 3 }).toISO()
                    },
                    type: KbqPipeTypes.Datetime,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable empty',
                    value: null,
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
                    name: 'removable empty',
                    value: null,
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
                },
                {
                    name: 'disabled empty',
                    value: null,
                    type: KbqPipeTypes.Datetime,

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
                    id: 'E2ETreeSelect',
                    value: 'value 0',
                    type: KbqPipeTypes.TreeSelect,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    id: 'E2ETreeSelect',
                    value: 'value 0',
                    type: KbqPipeTypes.TreeSelect,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable empty',
                    id: 'E2ETreeSelect',
                    value: null,
                    type: KbqPipeTypes.TreeSelect,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    id: 'E2ETreeSelect',
                    value: 'value 0',
                    type: KbqPipeTypes.TreeSelect,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'removable empty',
                    id: 'E2ETreeSelect',
                    value: null,
                    type: KbqPipeTypes.TreeSelect,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    id: 'E2ETreeSelect',
                    value: 'value 0',
                    type: KbqPipeTypes.TreeSelect,

                    cleanable: false,
                    removable: false,
                    disabled: true
                },
                {
                    name: 'disabled empty',
                    id: 'E2ETreeSelect',
                    value: null,
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
                    id: 'E2EMultiTreeSelect',
                    value: ['value 0'],
                    type: KbqPipeTypes.MultiTreeSelect,

                    search: true,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    id: 'E2EMultiTreeSelect',
                    value: ['value 2', 'value 3'],
                    type: KbqPipeTypes.MultiTreeSelect,

                    search: true,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable empty',
                    id: 'E2EMultiTreeSelect',
                    value: null,
                    type: KbqPipeTypes.MultiTreeSelect,

                    search: true,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    id: 'E2EMultiTreeSelect',
                    value: ['value 2', 'value 3'],
                    type: KbqPipeTypes.MultiTreeSelect,

                    search: true,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'removable empty',
                    id: 'E2EMultiTreeSelect',
                    value: null,
                    type: KbqPipeTypes.MultiTreeSelect,

                    search: true,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    id: 'E2EMultiTreeSelect',
                    value: ['value 2', 'value 3'],
                    type: KbqPipeTypes.MultiTreeSelect,

                    cleanable: false,
                    removable: false,
                    disabled: true
                },
                {
                    name: 'disabled empty',
                    id: 'E2EMultiTreeSelect',
                    value: [],
                    type: KbqPipeTypes.MultiTreeSelect,

                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        }
    ];

    ngAfterViewInit(): void {
        this.pipeTemplates = [
            {
                name: 'Select',
                id: 'E2ESelect',
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
                id: 'E2EMultiSelect',
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
                id: 'E2ETreeSelect',
                type: KbqPipeTypes.TreeSelect,
                values: kbqBuildTree(DEV_DATA_OBJECT, 0),

                cleanable: false,
                removable: false,
                disabled: false
            },
            {
                name: 'MultiTreeSelect',
                id: 'E2EMultiTreeSelect',
                type: KbqPipeTypes.MultiTreeSelect,
                values: kbqBuildTree(DEV_DATA_OBJECT, 0),

                cleanable: false,
                removable: false,
                disabled: false
            }
        ];
    }
}

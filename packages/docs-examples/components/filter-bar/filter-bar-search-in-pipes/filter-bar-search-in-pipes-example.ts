import { ChangeDetectionStrategy, Component } from '@angular/core';
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
 * @title filter-bar-search-in-pipes
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'filter-bar-search-in-pipes-example',
    imports: [
        KbqFilterBarModule
    ],
    template: `
        <kbq-filter-bar
            [filter]="activeFilter"
            [pipeTemplates]="pipeTemplates"
            [selectedAllEqualsSelectedNothing]="false"
            (filterChange)="onFilterChange($event)"
            (onChangePipe)="onChangePipe($event)"
        >
            @for (pipe of activeFilter.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
        </kbq-filter-bar>
    `
})
export class FilterBarSearchInPipesExample {
    activeFilter: KbqFilter = this.getDefaultFilter();

    pipeTemplates: KbqPipeTemplate[] = [
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

                    search: true,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'MultiSelect',
                    type: KbqPipeTypes.MultiSelect,
                    value: null,

                    search: true,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'TreeSelect',
                    type: KbqPipeTypes.TreeSelect,
                    value: null,

                    search: true,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'TreeSelect Multiple',
                    id: 'MultiTreeSelect',
                    type: KbqPipeTypes.MultiTreeSelect,
                    value: null,

                    search: true,
                    selectedAllEqualsSelectedNothing: true,

                    cleanable: true,
                    removable: false,
                    disabled: false
                }
            ]
        };
    }

    onFilterChange($event) {
        console.log('onFilterChange: ', $event);
    }

    onChangePipe($event) {
        console.log('onChangePipe: ', $event);
    }
}

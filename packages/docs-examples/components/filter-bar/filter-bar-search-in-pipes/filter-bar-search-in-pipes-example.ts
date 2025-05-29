import { Component } from '@angular/core';
import {
    kbqBuildTree,
    KbqFilter,
    KbqFilterBarModule,
    KbqPipeTemplate,
    KbqPipeTypes
} from '@koobiq/components/filter-bar';

const DATA_OBJECT = {
    'Без ролей': 'value 0',
    'Management and Configuration': {
        Администратор: { value: 'value 1' },
        Оператор: 'value 2',
        Пользователь: 'value 3'
    },
    'MP 10': {
        Администратор: 'value 4',
        Оператор: 'value 5',
        Пользователь: 'value 6'
    },
    'Knowledge Base': {
        Администратор: 'value 7',
        Оператор: 'value 8',
        Пользователь: 'value 9'
    }
};

/**
 * @title filter-bar-search-in-pipes
 */
@Component({
    standalone: true,
    selector: 'filter-bar-search-in-pipes-example',
    imports: [
        KbqFilterBarModule
    ],
    template: `
        <kbq-filter-bar [(filter)]="activeFilter" [pipeTemplates]="pipeTemplates">
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

                    cleanable: true,
                    removable: false,
                    disabled: false
                }
            ]
        };
    }
}

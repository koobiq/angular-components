import { ChangeDetectionStrategy, Component } from '@angular/core';
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
 * @title filter-bar-master-checkbox
 */
@Component({
    standalone: true,
    selector: 'filter-bar-master-checkbox-example',
    imports: [
        KbqFilterBarModule
    ],
    template: `
        <kbq-filter-bar
            [(filter)]="activeFilter"
            [pipeTemplates]="pipeTemplates"
            (filterChange)="onFilterChange($event)"
            (onChangePipe)="onChangePipe($event)"
        >
            @for (pipe of activeFilter.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
        </kbq-filter-bar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarMasterCheckboxExample {
    activeFilter: KbqFilter = {
        name: '',
        readonly: false,
        disabled: false,
        changed: false,
        saved: false,
        pipes: [
            {
                name: 'MultiSelect',
                value: [
                    { name: 'Option 1', id: '1' },
                    { name: 'Option 3', id: '3' },
                    { name: 'Option 4', id: '4' }
                ],
                type: KbqPipeTypes.MultiSelect,

                search: true,
                selectAll: true,

                cleanable: true,
                removable: false,
                disabled: false
            },
            {
                name: 'TreeSelect Multiple',
                id: 'MultiTreeSelect',
                type: KbqPipeTypes.MultiTreeSelect,
                value: ['value 2', 'value 3'],

                search: true,
                selectAll: true,

                cleanable: true,
                removable: false,
                disabled: false
            }
        ]
    };

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'MultiSelect',
            type: KbqPipeTypes.MultiSelect,
            values: Array.from({ length: 20 }, (_, i) => ({ name: `Option #${i}`, id: i.toString() })),
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'MultiTreeSelect',
            type: KbqPipeTypes.MultiTreeSelect,
            values: kbqBuildTree(DATA_OBJECT, 0),
            cleanable: false,
            removable: true,
            disabled: false
        }
    ];

    onFilterChange($event) {
        console.log('onFilterChange: ', $event);
    }

    onChangePipe($event) {
        console.log('onChangePipe: ', $event);
    }
}

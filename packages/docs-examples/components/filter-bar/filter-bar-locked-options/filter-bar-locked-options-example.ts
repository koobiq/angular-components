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
        Administrator: 'value 1',
        Operator: 'value 2',
        User: 'value 3'
    },
    'MP 10': {
        Administrator: 'value 4',
        Operator: 'value 5',
        User: 'value 6'
    }
};

const SELECT_VALUES = Array.from({ length: 6 }, (_, i) => ({ name: `Option #${i}`, id: i.toString() }));

/**
 * @title filter-bar-locked-options
 */
@Component({
    selector: 'filter-bar-locked-options-example',
    imports: [
        KbqFilterBarModule
    ],
    template: `
        <kbq-filter-bar
            [filter]="activeFilter"
            [pipeTemplates]="pipeTemplates"
            [selectedAllEqualsSelectedNothing]="false"
        >
            @for (pipe of activeFilter.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
        </kbq-filter-bar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarLockedOptionsExample {
    activeFilter: KbqFilter = {
        name: '',
        readonly: false,
        disabled: false,
        changed: false,
        saved: false,
        pipes: [
            {
                name: 'MultiSelect',
                id: 'MultiSelect',
                type: KbqPipeTypes.MultiSelect,
                // The locked options are added on their own — listing them here is not required.
                value: [{ name: 'Option #3', id: '3' }],

                search: true,

                cleanable: true,
                removable: false,
                disabled: false
            },
            {
                name: 'MultiTreeSelect',
                id: 'MultiTreeSelect',
                type: KbqPipeTypes.MultiTreeSelect,
                value: ['value 2'],

                search: true,

                cleanable: true,
                removable: false,
                disabled: false
            }
        ]
    };

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'MultiSelect',
            id: 'MultiSelect',
            type: KbqPipeTypes.MultiSelect,
            values: SELECT_VALUES,
            // Same shape as the entries of the pipe's `value`: matched by the id-based comparator.
            lockedValues: [SELECT_VALUES[0]],
            cleanable: true,
            removable: false,
            disabled: false
        },
        {
            name: 'MultiTreeSelect',
            id: 'MultiTreeSelect',
            type: KbqPipeTypes.MultiTreeSelect,
            values: kbqBuildTree(DATA_OBJECT, 0),
            // Raw node values here; locking the `MP 10` branch would lock its whole subtree.
            lockedValues: ['value 0'],
            cleanable: true,
            removable: false,
            disabled: false
        }
    ];
}

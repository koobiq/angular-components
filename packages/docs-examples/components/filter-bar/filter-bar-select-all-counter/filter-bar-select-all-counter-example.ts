import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    kbqBuildTree,
    type KbqFilter,
    KbqFilterBarModule,
    type KbqPipeTemplate,
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
        Administrator: { value: 'value 4' },
        Operator: 'value 5',
        User: 'value 6'
    },
    'Knowledge Base': {
        Administrator: { value: 'value 7' },
        Operator: 'value 8',
        User: 'value 9'
    }
};

/**
 * @title filter-bar-select-all-counter
 */
@Component({
    selector: 'filter-bar-select-all-counter-example',
    imports: [
        KbqFilterBarModule
    ],
    template: `
        <kbq-filter-bar
            [pipeTemplates]="pipeTemplates"
            [(filter)]="activeFilter"
            (filterChange)="onFilterChange($event)"
            (onChangePipe)="onChangePipe($event)"
        >
            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
        </kbq-filter-bar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarSelectAllCounterExample {
    activeFilter: KbqFilter | null = {
        name: '',
        readonly: false,
        disabled: false,
        changed: false,
        saved: false,
        pipes: [
            {
                name: 'MultiSelect',
                value: null,
                type: KbqPipeTypes.MultiSelect,

                search: true,
                selectAll: true,
                selectAllCounter: true,

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
                selectAll: true,
                selectAllCounter: true,

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

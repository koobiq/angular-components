import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFilter, KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';

/**
 * @title filter-bar-no-options
 */
@Component({
    selector: 'filter-bar-no-options-example',
    imports: [
        KbqFilterBarModule
    ],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [(filter)]="activeFilter">
            @for (pipe of activeFilter.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
        </kbq-filter-bar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarNoOptionsExample {
    activeFilter: KbqFilter = this.getDefaultFilter();

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Select',
            id: 'Select',
            type: KbqPipeTypes.Select,
            values: [],

            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'MultiSelect',
            id: 'MultiSelect',
            type: KbqPipeTypes.MultiSelect,
            values: [],

            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'TreeSelect',
            id: 'TreeSelect',
            type: KbqPipeTypes.TreeSelect,
            values: [],

            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'MultiTreeSelect',
            id: 'MultiTreeSelect',
            type: KbqPipeTypes.MultiTreeSelect,
            values: [],

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
                    id: 'Select',
                    type: KbqPipeTypes.Select,
                    value: null,
                    search: true,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'MultiSelect',
                    id: 'MultiSelect',
                    type: KbqPipeTypes.MultiSelect,
                    value: null,
                    search: true,
                    selectAll: true,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'TreeSelect',
                    id: 'TreeSelect',
                    type: KbqPipeTypes.TreeSelect,
                    value: null,
                    search: true,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'MultiTreeSelect',
                    id: 'MultiTreeSelect',
                    type: KbqPipeTypes.MultiTreeSelect,
                    value: null,
                    search: true,
                    selectAll: true,

                    cleanable: true,
                    removable: false,
                    disabled: false
                }
            ]
        };
    }
}

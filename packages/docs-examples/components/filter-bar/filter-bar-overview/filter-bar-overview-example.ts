import { Component } from '@angular/core';
import { KbqFilter, KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';

/**
 * @title filter bar
 */
@Component({
    standalone: true,
    selector: 'filter-bar-overview-example',
    imports: [
        KbqFilterBarModule
    ],
    template: `
        <kbq-filter-bar
            [pipeTemplates]="pipeTemplates"
            [activeFilter]="activeFilter"
            style="height: 160px; align-items: center; justify-content: center"
        >
            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbq-pipe="pipe" />
            }
        </kbq-filter-bar>
    `
})
export class FilterBarOverviewExample {
    activeFilter: KbqFilter | null = {
        name: 'Select',
        readonly: false,
        disabled: false,
        changed: false,
        saved: false,
        pipes: [
            {
                name: 'Тип',
                type: KbqPipeTypes.Select,
                value: '',

                required: false,
                cleanable: false,
                removable: true,
                disabled: false
            },
            {
                name: 'Тип',
                type: KbqPipeTypes.Select,
                value: { name: 'Фишинг' },

                required: false,
                cleanable: true,
                removable: false,
                disabled: false
            },
            {
                name: 'Организация',
                value: [
                    { name: 'Option 1', id: '1' },
                    { name: 'Option 2', id: '2' },
                    { name: 'Option 3', id: '3' }
                ],
                type: KbqPipeTypes.MultiSelect,

                required: false,
                cleanable: true,
                removable: false,
                disabled: false
            }
        ]
    };

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Select',
            type: KbqPipeTypes.Select,
            values: [
                { name: 'Фишинг' },
                { name: 'Option 2' },
                { name: 'Option 3' },
                { name: 'Option 4' },
                { name: 'Option 5' },
                { name: 'Option 6' },
                { name: 'Option 7' },
                { name: 'Option 8' },
                { name: 'Option 9' },
                { name: 'Option 10' }],

            required: false,
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
                { name: 'Option 7', id: '7' },
                { name: 'Option 8', id: '8' },
                { name: 'Option 9', id: '9' },
                { name: 'Option 10', id: '10' }
            ],
            required: false,
            cleanable: false,
            removable: false,
            disabled: false
        }
    ];
}

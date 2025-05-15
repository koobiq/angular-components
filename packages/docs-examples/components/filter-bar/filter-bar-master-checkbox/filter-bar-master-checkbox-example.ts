import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFilter, KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';

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
        <kbq-filter-bar [(filter)]="activeFilter" [pipeTemplates]="pipeTemplates">
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

                required: false,
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
            values: [
                { name: 'Option 1', id: '1' },
                { name: 'Option 2', id: '2' },
                { name: 'Option 3', id: '3' },
                { name: 'Option 4', id: '4' },
                { name: 'Option 5', id: '5' },
                { name: 'Option 6', id: '6' },
                { name: 'Option 7', id: '7' },
                { name: 'Option 21', id: '21' },
                { name: 'Option 22', id: '22' },
                { name: 'Option 23', id: '23' },
                { name: 'Option 24', id: '24' },
                { name: 'Option 25', id: '25' },
                { name: 'Option 26', id: '26' },
                { name: 'Option 27', id: '27' }
            ],
            required: false,
            cleanable: false,
            removable: true,
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

            required: false,
            cleanable: false,
            removable: true,
            disabled: false
        }
    ];
}

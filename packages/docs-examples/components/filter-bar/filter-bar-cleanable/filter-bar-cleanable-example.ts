import { Component } from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFilterBarModule, KbqPipe, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';

/**
 * @title filter-bar-cleanable
 */
@Component({
    standalone: true,
    selector: 'filter-bar-cleanable-example',
    imports: [
        KbqFilterBarModule,
        KbqLuxonDateModule
    ],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates">
            @for (pipe of pipes; track pipe) {
                <ng-container *kbq-pipe="pipe" />
            }
        </kbq-filter-bar>
    `
})
export class FilterBarCleanableExample {
    pipes: KbqPipe[] = [
        {
            name: 'select',
            type: KbqPipeTypes.Select,

            required: false,
            cleanable: true,
            removable: false,
            disabled: false
        },
        {
            name: 'MultiSelect',
            type: KbqPipeTypes.MultiSelect,

            required: false,
            cleanable: true,
            removable: false,
            disabled: false
        },
        {
            name: 'Text',
            type: KbqPipeTypes.Text,

            required: false,
            cleanable: true,
            removable: false,
            disabled: false
        }
    ];

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
                { name: 'Option 8', id: '8' },
                { name: 'Option 9', id: '9' },
                { name: 'Option 10', id: '10' }
            ],
            required: false,
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

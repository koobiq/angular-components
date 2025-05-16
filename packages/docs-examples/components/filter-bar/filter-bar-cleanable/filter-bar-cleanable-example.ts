import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFilterBarModule, KbqPipe, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';

/**
 * @title filter-bar-cleanable
 */
@Component({
    standalone: true,
    selector: 'filter-bar-cleanable-example',
    imports: [
        KbqFilterBarModule,
        LuxonDateModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates">
            @for (pipe of pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
        </kbq-filter-bar>
    `
})
export class FilterBarCleanableExample {
    pipes: KbqPipe[] = [
        {
            name: 'Select',
            type: KbqPipeTypes.Select,
            value: { name: 'Option 1', id: '1' },

            cleanable: true,
            removable: false,
            disabled: false
        },
        {
            name: 'MultiSelect',
            type: KbqPipeTypes.MultiSelect,
            value: null,

            cleanable: true,
            removable: false,
            disabled: false
        },
        {
            name: 'Text',
            type: KbqPipeTypes.Text,
            value: null,

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
                { name: 'Option 7', id: '7' }
            ],
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
                { name: 'Option 7', id: '7' }
            ],

            cleanable: false,
            removable: false,
            disabled: false
        }
    ];
}

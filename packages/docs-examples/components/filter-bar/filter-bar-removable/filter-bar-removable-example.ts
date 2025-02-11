import { Component } from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFilter, KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';

/**
 * @title filter-bar-removable
 */
@Component({
    standalone: true,
    selector: 'filter-bar-removable-example',
    imports: [
        KbqFilterBarModule,
        KbqLuxonDateModule
    ],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [activeFilter]="activeFilter">
            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbq-pipe="pipe" />
            }
        </kbq-filter-bar>
    `
})
export class FilterBarRemovableExample {
    activeFilter: KbqFilter | null = {
        name: 'Select',
        readonly: false,
        disabled: false,
        changed: false,
        saved: false,
        pipes: [
            {
                name: 'Select',
                type: KbqPipeTypes.Select,
                value: { name: 'Value' },

                required: false,
                cleanable: false,
                removable: true,
                disabled: false
            },
            {
                name: 'SelectMultiple',
                type: KbqPipeTypes.MultiSelect,
                value: [],

                required: false,
                cleanable: false,
                removable: true,
                disabled: false
            }
        ]
    };

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Select',
            type: KbqPipeTypes.Select,
            values: [
                { name: 'Value' },
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
            name: 'Select',
            type: KbqPipeTypes.MultiSelect,
            values: [
                { name: 'Value' },
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
        }
    ];
}

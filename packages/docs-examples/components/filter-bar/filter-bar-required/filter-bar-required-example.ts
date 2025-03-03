import { Component } from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFilter, KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';

/**
 * @title filter-bar-required
 */
@Component({
    standalone: true,
    selector: 'filter-bar-required-example',
    imports: [
        KbqFilterBarModule,
        KbqLuxonDateModule
    ],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [filter]="activeFilter" (onResetFilter)="onReset()">
            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add />

            <kbq-filter-reset />
        </kbq-filter-bar>
    `
})
export class FilterBarRequiredExample {
    activeFilter: KbqFilter | null = {
        name: 'Select',
        readonly: false,
        disabled: false,
        changed: false,
        saved: false,
        pipes: [
            {
                name: 'Datetime',
                type: KbqPipeTypes.Datetime,
                value: { name: 'Последние 24 часа', start: null, end: { hours: -24 } },

                required: true,
                cleanable: false,
                removable: false,
                disabled: false
            }
        ]
    };

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Date',
            type: KbqPipeTypes.Date,
            values: [
                { name: 'Последний день', start: null, end: { days: -1 } },
                { name: 'Последние 3 дня', start: null, end: { days: -3 } },
                { name: 'Последние 7 дней', start: null, end: { days: -7 } },
                { name: 'Последние 30 дней', start: null, end: { days: -30 } },
                { name: 'Последние 90 дней', start: null, end: { days: -90 } },
                { name: 'Последний год', start: null, end: { years: -1 } }
            ],
            required: false,
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Datetime',
            type: KbqPipeTypes.Datetime,
            values: [
                { name: 'Последний час', start: null, end: { hours: -1 } },
                { name: 'Последние 3 часа', start: null, end: { hours: -3 } },
                { name: 'Последние 24 часа', start: null, end: { hours: -24 } },
                { name: 'Последние 3 дня', start: null, end: { days: -3 } },
                { name: 'Последние 7 дней', start: null, end: { days: -7 } },
                { name: 'Последние 30 дней', start: null, end: { days: -30 } },
                { name: 'Последние 90 дней', start: null, end: { days: -90 } },
                { name: 'Последний год', start: null, end: { years: -1 } }
            ],
            required: false,
            cleanable: false,
            removable: true,
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
        },
        {
            name: 'Text',
            type: KbqPipeTypes.Text,

            required: false,
            cleanable: false,
            removable: true,
            disabled: false
        }
    ];

    onReset() {
        this.activeFilter = this.getDefaultFilter();
    }

    getDefaultFilter(): KbqFilter {
        return {
            name: '',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'Datetime',
                    type: KbqPipeTypes.Datetime,
                    value: { name: 'Последние 24 часа', start: null, end: { hours: -24 } },

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ]
        };
    }
}

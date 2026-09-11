import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateFormatter } from '@koobiq/components/core';
import { KbqFilter, KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';
import { injectLocalizedPeriods } from '../localized-data';

/**
 * @title filter-bar-removable
 */
@Component({
    selector: 'filter-bar-removable-example',
    imports: [
        KbqFilterBarModule,
        LuxonDateModule
    ],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates()" [(filter)]="activeFilter">
            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add />
        </kbq-filter-bar>
    `,
    providers: [DateFormatter],
    changeDetection: ChangeDetectionStrategy.OnPush
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
                value: { name: 'Option 1', id: '1' },

                cleanable: false,
                removable: true,
                disabled: false
            },
            {
                name: 'MultiSelect',
                type: KbqPipeTypes.MultiSelect,
                value: [],

                cleanable: false,
                removable: true,
                disabled: false
            }
        ]
    };

    /** Period labels follow the active locale, so the templates are rebuilt whenever it changes. */
    protected readonly periods = injectLocalizedPeriods();

    readonly pipeTemplates = computed<KbqPipeTemplate[]>(() => [
        {
            name: 'Date',
            type: KbqPipeTypes.Date,
            values: this.periods.date(),
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Datetime',
            type: KbqPipeTypes.Datetime,
            values: this.periods.datetime(),
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

            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Text',
            type: KbqPipeTypes.Text,

            cleanable: false,
            removable: true,
            disabled: false
        }
    ]);
}

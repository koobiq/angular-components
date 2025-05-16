import { Component } from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFilter, KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';

/**
 * @title filter-bar-pipe-types
 */
@Component({
    standalone: true,
    selector: 'filter-bar-pipe-types-example',
    imports: [
        KbqFilterBarModule,
        LuxonDateModule
    ],
    template: `
        <kbq-filter-bar [(filter)]="activeFilter" [pipeTemplates]="pipeTemplates">
            @for (pipe of activeFilter.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            @if (activeFilter?.changed) {
                <kbq-filter-reset (onResetFilter)="onResetFilter()" />
            }
        </kbq-filter-bar>
    `
})
export class FilterBarPipeTypesExample {
    activeFilter: KbqFilter = this.getDefaultFilter();

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Date',
            type: KbqPipeTypes.Date,
            values: [
                { name: 'Последний день', start: { days: -1 }, end: null },
                { name: 'Последние 3 дня', start: { days: -3 }, end: null },
                { name: 'Последние 7 дней', start: { days: -7 }, end: null },
                { name: 'Последние 30 дней', start: { days: -30 }, end: null },
                { name: 'Последние 90 дней', start: { days: -90 }, end: null },
                { name: 'Последний год', start: { years: -1 }, end: null }
            ],
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'Datetime',
            type: KbqPipeTypes.Datetime,
            values: [
                { name: 'Последний час', start: { hours: -1 }, end: null },
                { name: 'Последние 3 часа', start: { hours: -3 }, end: null },
                { name: 'Последние 24 часа', start: { hours: -24 }, end: null },
                { name: 'Последние 3 дня', start: { days: -3 }, end: null },
                { name: 'Последние 7 дней', start: { days: -7 }, end: null },
                { name: 'Последние 30 дней', start: { days: -30 }, end: null },
                { name: 'Последние 90 дней', start: { days: -90 }, end: null },
                { name: 'Последний год', start: { years: -1 }, end: null }
            ],
            cleanable: true,
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

    onResetFilter() {
        console.log('onResetFilter: ');
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
                    name: 'Select',
                    type: KbqPipeTypes.Select,
                    value: null,

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
                },
                {
                    name: 'Date',
                    type: KbqPipeTypes.Date,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Datetime',
                    type: KbqPipeTypes.Datetime,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                }
            ]
        };
    }
}

import { Component } from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqFilter, KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title filter-bar-readonly-pipes
 */
@Component({
    standalone: true,
    selector: 'filter-bar-readonly-pipes-example',
    imports: [
        KbqFilterBarModule,
        LuxonDateModule,
        KbqDlModule,
        KbqLinkModule
    ],
    template: `
        <kbq-filter-bar [(filter)]="activeFilter" [pipeTemplates]="pipeTemplates">
            @for (pipe of activeFilter.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add />

            @if (activeFilter?.changed) {
                <kbq-filter-reset (onResetFilter)="onResetFilter()" />
            }

            <kbq-filter-search />
        </kbq-filter-bar>

        <br />

        <kbq-dl [minWidth]="590">
            <kbq-dt>Пользователь</kbq-dt>
            <kbq-dd><span (click)="setUser('Пользователь', 'rturov')" kbq-link pseudo>rturov</span></kbq-dd>

            @for (item of readonlyPipes; track item) {
                <kbq-dt>{{ item.name }}</kbq-dt>
                <kbq-dd>
                    <span (click)="addPipe(item.name, item.value)" kbq-link pseudo>{{ item.value }}</span>
                </kbq-dd>
            }
        </kbq-dl>
    `
})
export class FilterBarReadonlyPipesExample {
    readonlyPipes = [
        { name: 'Домен', value: 'Управление системой' },
        { name: 'Тип объекта', value: 'PaxMatrol IEMS' },
        { name: 'Действие', value: 'Изменение' },
        { name: 'Объект', value: 'Resolver' }
    ];
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
            required: false,
            cleanable: false,
            removable: true,
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
                    name: 'Пользователь',
                    value: null,
                    type: KbqPipeTypes.ReadOnly,

                    required: true,
                    cleanable: true,
                    removable: false,
                    disabled: false
                }
            ]
        };
    }

    setUser(name: string, value: string) {
        const userPipe = this.activeFilter.pipes.find((pipe) => pipe.name === name);

        if (userPipe) {
            userPipe.value = value;

            this.activeFilter = { ...this.activeFilter };

            this.activeFilter.changed = true;
        }
    }

    addPipe(name: string, value: string) {
        if (!this.activeFilter.pipes.find((pipe) => pipe.name === name)) {
            this.activeFilter.pipes.push({
                name,
                value,
                type: KbqPipeTypes.ReadOnly,

                required: false,
                cleanable: false,
                removable: true
            });

            this.activeFilter.changed = true;
        }
    }
}

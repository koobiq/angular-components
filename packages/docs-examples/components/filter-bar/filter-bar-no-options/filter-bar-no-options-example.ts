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
            name: 'Tenant',
            id: 'Tenant',
            type: KbqPipeTypes.Select,
            values: [],

            cleanable: false,
            removable: true,
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
                    name: 'Tenant',
                    id: 'Tenant',
                    type: KbqPipeTypes.Select,
                    value: null,
                    search: true,

                    cleanable: false,
                    removable: true,
                    disabled: false
                }
            ]
        };
    }
}

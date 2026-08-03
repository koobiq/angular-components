import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFilter, KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';

const OPTIONS = Array.from({ length: 12 }, (_, index) => ({ name: `Option ${index + 1}`, id: `${index + 1}` }));

/**
 * @title filter-bar-panel-max-height
 */
@Component({
    selector: 'filter-bar-panel-max-height-example',
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
export class FilterBarPanelMaxHeightExample {
    activeFilter: KbqFilter = this.getDefaultFilter();

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Default height',
            id: 'DefaultHeight',
            type: KbqPipeTypes.Select,
            values: OPTIONS,

            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: '160px',
            id: 'CappedHeight',
            type: KbqPipeTypes.Select,
            values: OPTIONS,
            panelMaxHeight: 160,

            cleanable: false,
            removable: false,
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
                    name: 'Default height',
                    id: 'DefaultHeight',
                    type: KbqPipeTypes.Select,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: '160px',
                    id: 'CappedHeight',
                    type: KbqPipeTypes.Select,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                }
            ]
        };
    }
}

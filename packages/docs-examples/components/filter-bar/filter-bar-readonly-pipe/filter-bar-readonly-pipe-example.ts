import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFilter, KbqFilterBarModule, KbqPipeTypes } from '@koobiq/components/filter-bar';

/**
 * @title filter-bar-readonly-pipe
 */
@Component({
    selector: 'filter-bar-readonly-pipe-example',
    imports: [
        KbqFilterBarModule
    ],
    template: `
        <kbq-filter-bar [filter]="activeFilter">
            @for (pipe of activeFilter.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
        </kbq-filter-bar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarReadonlyPipeExample {
    activeFilter: KbqFilter = {
        name: '',
        readonly: false,
        disabled: false,
        changed: false,
        saved: false,
        pipes: [
            {
                name: 'Filter',
                value: 'Value',
                type: KbqPipeTypes.ReadOnly,

                cleanable: false,
                removable: true,
                disabled: false
            }
        ]
    };
}

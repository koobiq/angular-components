import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFilterBarModule, KbqPipe, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';
import { DateTime } from 'luxon';

/**
 * @title filter-bar-date-limits
 */
@Component({
    selector: 'filter-bar-date-limits-example',
    imports: [
        KbqFilterBarModule,
        LuxonDateModule
    ],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates">
            @for (pipe of pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
        </kbq-filter-bar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarDateLimitsExample {
    pipes: KbqPipe[] = [
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
    ];

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Date',
            type: KbqPipeTypes.Date,
            // Selectable window: from a year ago up to today (only the day is used by the `date` pipe).
            minDateTime: DateTime.now().minus({ years: 1 }),
            maxDateTime: DateTime.now(),
            // The selected period must not be longer than 3 months.
            maxInterval: { months: 3 },
            cleanable: true,
            removable: false,
            disabled: false
        },
        {
            name: 'Datetime',
            type: KbqPipeTypes.Datetime,
            // Selectable window: the last 7 days up to now (date and time).
            minDateTime: DateTime.now().minus({ days: 7 }),
            maxDateTime: DateTime.now(),
            // The selected period must be between 1 hour and 3 days long.
            minInterval: { hours: 1 },
            maxInterval: { days: 3 },
            cleanable: true,
            removable: false,
            disabled: false
        }
    ];
}

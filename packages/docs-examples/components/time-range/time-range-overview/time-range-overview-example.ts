import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTimeRange } from '@koobiq/components/time-range';

/**
 * @title Time range overview
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'time-range-overview-example',
    imports: [
        KbqTimeRange,
        KbqLuxonDateModule,
        KbqIconModule,
        KbqButtonModule,
        JsonPipe
    ],
    template: `
        <ng-template #titleTemplate let-context>
            {{ context | json }}
            <button kbq-button aria-label="time range trigger">
                <i kbq-icon="kbq-calendar-o_16"></i>
            </button>
        </ng-template>
        <kbq-time-range [titleTemplate]="titleTemplate" />

        <kbq-time-range />
    `,
    host: {
        class: 'layout-flex layout-column'
    }
})
export class TimeRangeOverviewExample {}

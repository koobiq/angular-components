import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormattersModule } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTimeRange, KbqTimeRangeRange } from '@koobiq/components/time-range';

/**
 * @title Time range overview
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'time-range-overview-example',
    imports: [
        ReactiveFormsModule,
        KbqTimeRange,
        KbqLuxonDateModule,
        KbqIconModule,
        KbqButtonModule,
        KbqFormattersModule
    ],
    template: `
        <ng-template #titleTemplate>
            <button kbq-button aria-label="time range trigger">
                <i kbq-icon="kbq-calendar-o_16"></i>
            </button>
        </ng-template>

        <kbq-time-range [titleTemplate]="titleTemplate" />

        <kbq-time-range [formControl]="control" />
    `,
    host: {
        class: 'layout-flex layout-column'
    }
})
export class TimeRangeOverviewExample {
    control = new FormControl<KbqTimeRangeRange | undefined>(undefined);
}

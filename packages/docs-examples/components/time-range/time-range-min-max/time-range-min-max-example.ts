import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { KbqTimeRange } from '@koobiq/components/time-range';
import { DateTime } from 'luxon';

/**
 * @title Time range min max
 */
@Component({
    selector: 'time-range-min-max-example',
    imports: [
        ReactiveFormsModule,
        KbqTimeRange,
        LuxonDateModule
    ],
    template: `
        <div>
            <div style="color: var(--kbq-foreground-contrast-secondary)">From 2017 to 2025</div>
            <kbq-time-range [minDate]="minDate" [maxDate]="maxDate" [nonNullable]="false" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] }],
    host: {
        class: 'layout-flex layout-column layout-align-center-center layout-gap-xs'
    }
})
export class TimeRangeMinMaxExample {
    protected readonly adapter = inject<DateAdapter<DateTime>>(DateAdapter);

    protected readonly minDate = this.adapter.createDate(2017, 0, 1);
    protected readonly maxDate = this.adapter.today();
}

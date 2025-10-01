import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { KbqTimeRange, KbqTimeRangeType } from '@koobiq/components/time-range';

/**
 * @title Time range empty type list
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'time-range-empty-type-list-example',
    imports: [
        ReactiveFormsModule,
        KbqTimeRange,
        LuxonDateModule
    ],
    providers: [
        { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] }],
    template: `
        <kbq-time-range [availableTimeRangeTypes]="availableTimeRangeTypes" />
    `,
    host: {
        class: 'layout-flex layout-row layout-align-center-center layout-gap-3xl'
    }
})
export class TimeRangeEmptyTypeListExample {
    protected readonly availableTimeRangeTypes: KbqTimeRangeType[] = [];
}

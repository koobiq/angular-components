import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { KbqTimeRange, KbqTimeRangeRange, KbqTimeRangeType } from '@koobiq/components/time-range';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Time range overview
 */
@Component({
    selector: 'time-range-overview-example',
    imports: [
        ReactiveFormsModule,
        KbqTimeRange,
        LuxonDateModule
    ],
    template: `
        <span>{{ text().events }}</span>
        <kbq-time-range [formControl]="control" [availableTimeRangeTypes]="availableTimeRangeTypes" />
    `,
    providers: [
        { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-flex layout-row layout-align-center-center layout-gap-xxs'
    }
})
export class TimeRangeOverviewExample extends BaseLocalizedExample<ExampleText> {
    protected readonly control = new FormControl<KbqTimeRangeRange>(
        {
            type: 'last5Minutes'
        },
        { nonNullable: true }
    );

    protected readonly availableTimeRangeTypes: KbqTimeRangeType[] = [
        'lastMinute',
        'last5Minutes',
        'last15Minutes',
        'last30Minutes',
        'lastHour',
        'last24Hours',
        'last3Days',
        'last7Days',
        'last14Days',
        'last30Days',
        'last3Months',
        'last12Months',
        'currentQuarter',
        'currentYear',
        'allTime',
        'range'
    ];

    constructor() {
        super(TEXT);
    }
}

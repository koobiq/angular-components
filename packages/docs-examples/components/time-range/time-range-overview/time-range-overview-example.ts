import { ChangeDetectionStrategy, Component, computed, inject, InjectionToken } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE, KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { KbqTimeRange, KbqTimeRangeRange, KbqTimeRangeType } from '@koobiq/components/time-range';
import { of } from 'rxjs';

const ExampleLocalizedData = new InjectionToken<Record<string | 'default', string>>('ExampleLocalizedData', {
    factory: () => ({
        'ru-RU': 'События',
        default: 'Events'
    })
});

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
        <span>{{ caption() }}</span>
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
export class TimeRangeOverviewExample {
    private readonly data = inject(ExampleLocalizedData);
    private readonly localeId = toSignal(inject(KBQ_LOCALE_SERVICE, { optional: true })?.changes || of(''));

    protected readonly caption = computed(() => this.data[this.localeId() || 'default'] ?? this.data.default);

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
}

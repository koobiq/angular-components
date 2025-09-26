import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqButtonModule } from '@koobiq/components/button';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { KbqCleaner, KbqFormField } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTimeRange, KbqTimeRangeRange, KbqTimeRangeType } from '@koobiq/components/time-range';

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
        KbqIconModule,
        KbqButtonModule,
        KbqCleaner,
        KbqFormField,
        KbqSelectModule,
        LuxonDateModule,
        JsonPipe
    ],
    providers: [
        { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] }],
    template: `
        <ng-template #titleTemplate>
            <button kbq-button aria-label="time range trigger">
                <i kbq-icon="kbq-calendar-o_16"></i>
            </button>
        </ng-template>

        <kbq-time-range [formControl]="control" [availableTimeRangeTypes]="selected.value" />

        <div style="width: 300px;">
            <kbq-form-field>
                <kbq-select multiple placeholder="Placeholder" [formControl]="selected">
                    @for (option of availableTimeRangeTypes; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }

                    <kbq-cleaner #kbqSelectCleaner />
                </kbq-select>
            </kbq-form-field>
        </div>

        {{ control.value | json }}
    `,
    host: {
        class: 'layout-flex layout-row layout-align-center-center layout-gap-3xl'
    }
})
export class TimeRangeOverviewExample {
    protected readonly control = new FormControl<KbqTimeRangeRange | null>(
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
        'allTime',
        'currentQuarter',
        'currentYear',
        'range'
    ];

    protected readonly selected = new FormControl<KbqTimeRangeType[]>(this.availableTimeRangeTypes, {
        nonNullable: true
    });
}

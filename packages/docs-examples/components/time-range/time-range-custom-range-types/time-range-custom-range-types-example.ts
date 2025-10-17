import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KBQ_CUSTOM_TIME_RANGE_TYPES, KbqCustomTimeRangeType, KbqTimeRangeModule } from '@koobiq/components/time-range';

export const customTypes: KbqCustomTimeRangeType[] = [
    { type: 'last3Seconds', units: { seconds: 3 }, translationType: 'seconds' },
    { type: 'last3Minutes', units: { minutes: 3 }, translationType: 'minutes' },
    { type: 'last3Weeks', units: { weeks: 3 }, translationType: 'weeks' },
    { type: 'last2Months', units: { months: 2 }, translationType: 'months' }
];

/**
 * @title Time range custom range types
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'time-range-custom-range-types-example',
    imports: [
        ReactiveFormsModule,
        KbqTimeRangeModule,
        LuxonDateModule,
        KbqIconModule,
        KbqFormFieldModule,
        TitleCasePipe
    ],
    providers: [
        { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] },
        { provide: KBQ_CUSTOM_TIME_RANGE_TYPES, useValue: customTypes }
    ],
    template: `
        <ng-template #titleAsFormField let-context>
            <kbq-form-field>
                <kbq-time-range-title-as-control>
                    @if (!context.type) {
                        <span kbqTimeRangeTitlePlaceholder>{{ context.formattedDate }}</span>
                    } @else {
                        {{ context.formattedDate[0] | titlecase }}{{ context.formattedDate.slice(1) }}
                    }
                </kbq-time-range-title-as-control>
                <i kbq-icon="kbq-chevron-down-s_16" kbqSuffix [color]="'contrast-fade'"></i>
            </kbq-form-field>
        </ng-template>

        <kbq-time-range
            [titleTemplate]="titleAsFormField"
            [arrow]="false"
            [nonNullable]="false"
            [availableTimeRangeTypes]="availableTimeRangeTypes()"
        />
    `,
    host: {
        class: 'layout-flex layout-row layout-align-center-center layout-gap-3xl'
    }
})
export class TimeRangeCustomRangeTypesExample {
    availableTimeRangeTypes = signal([
        'last3Seconds',
        'last3Minutes',
        'last3Weeks',
        'last2Months'
    ]);
}

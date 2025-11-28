import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    KBQ_CUSTOM_TIME_RANGE_TYPES,
    KBQ_DEFAULT_TIME_RANGE_TYPES,
    KbqCustomTimeRangeType,
    KbqTimeRangeModule
} from '@koobiq/components/time-range';

export function customTypesFactory<D>(adapter: DateAdapter<D>): KbqCustomTimeRangeType[] {
    const currentYear = adapter.startOf(adapter.today(), 'year');

    return [
        {
            type: 'q1',
            units: {},
            translationType: 'other',
            range: {
                startDateTime: adapter.toIso8601(currentYear),
                endDateTime: adapter.toIso8601(adapter.addCalendarUnits(currentYear, { quarters: 1 }))
            }
        },
        {
            type: 'q2',
            units: {},
            translationType: 'other',
            range: {
                startDateTime: adapter.toIso8601(adapter.addCalendarUnits(currentYear, { quarters: 1 })),
                endDateTime: adapter.toIso8601(adapter.addCalendarUnits(currentYear, { quarters: 2 }))
            }
        },
        {
            type: 'q3',
            units: {},
            translationType: 'other',
            range: {
                startDateTime: adapter.toIso8601(adapter.addCalendarUnits(currentYear, { quarters: 2 })),
                endDateTime: adapter.toIso8601(adapter.addCalendarUnits(currentYear, { quarters: 3 }))
            }
        },
        {
            type: 'q4',
            units: {},
            translationType: 'other',
            range: {
                startDateTime: adapter.toIso8601(adapter.addCalendarUnits(currentYear, { quarters: 3 })),
                endDateTime: adapter.toIso8601(adapter.addCalendarUnits(currentYear, { quarters: 4 }))
            }
        }
    ];
}

/**
 * @title Time range custom option
 */
@Component({
    selector: 'time-range-custom-option-example',
    imports: [
        TitleCasePipe,
        ReactiveFormsModule,
        KbqTimeRangeModule,
        LuxonDateModule,
        KbqIconModule,
        KbqFormFieldModule
    ],
    template: `
        <ng-template #customOption let-context>
            {{ context.type | titlecase }}
        </ng-template>

        <ng-template #titleAsFormField let-context>
            <kbq-form-field>
                <kbq-time-range-title-as-control>
                    @if (!context.type) {
                        <span kbqTimeRangeTitlePlaceholder>{{ context.formattedDate }}</span>
                    } @else {
                        {{ context.type | titlecase }}
                    }
                </kbq-time-range-title-as-control>
                <i kbq-icon="kbq-chevron-down-s_16" kbqSuffix [color]="'contrast-fade'"></i>
            </kbq-form-field>
        </ng-template>

        <kbq-time-range
            [titleTemplate]="titleAsFormField"
            [arrow]="false"
            [nonNullable]="false"
            [optionTemplate]="customOption"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] },
        { provide: KBQ_CUSTOM_TIME_RANGE_TYPES, deps: [DateAdapter], useFactory: customTypesFactory },
        {
            provide: KBQ_DEFAULT_TIME_RANGE_TYPES,
            deps: [KBQ_CUSTOM_TIME_RANGE_TYPES],
            useFactory: (customTypes: KbqCustomTimeRangeType[]) => customTypes.map(({ type }) => type)
        }
    ],
    host: {
        class: 'layout-flex layout-row layout-align-center-center layout-gap-3xl'
    }
})
export class TimeRangeCustomOptionExample {}

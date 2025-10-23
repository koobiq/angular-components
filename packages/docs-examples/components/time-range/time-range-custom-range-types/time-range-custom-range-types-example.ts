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

const customTypes: KbqCustomTimeRangeType[] = [
    { type: 'last3Minutes', units: { minutes: -3 }, translationType: 'minutes' },
    { type: 'last3Weeks', units: { weeks: -3 }, translationType: 'weeks' },
    { type: 'last3Years', units: { years: -3 }, translationType: 'months' }
];

const customDefaultTypes = customTypes.map(({ type }) => type);

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
        { provide: KBQ_CUSTOM_TIME_RANGE_TYPES, useValue: customTypes },
        { provide: KBQ_DEFAULT_TIME_RANGE_TYPES, useValue: customDefaultTypes }
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

        <kbq-time-range [titleTemplate]="titleAsFormField" [arrow]="false" [nonNullable]="false" />
    `,
    host: {
        class: 'layout-flex layout-row layout-align-center-center layout-gap-3xl'
    }
})
export class TimeRangeCustomRangeTypesExample {}

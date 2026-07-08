import { ChangeDetectionStrategy, Component, computed, inject, InjectionToken } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE, KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    KBQ_CUSTOM_TIME_RANGE_TYPES,
    KBQ_DEFAULT_TIME_RANGE_TYPES,
    KbqCustomTimeRangeType,
    KbqTimeRangeModule,
    KbqTimeRangeTranslationType,
    KbqTimeRangeUnits
} from '@koobiq/components/time-range';
import { of } from 'rxjs';

const customTypes: KbqCustomTimeRangeType[] = [
    { type: 'last3Minutes', units: { minutes: -3 }, translationType: 'minutes' },
    { type: 'last3Weeks', units: { weeks: -3 }, translationType: 'weeks' },
    { type: 'last3Years', units: { years: -3 }, translationType: 'months' }
];

const customDefaultTypes = customTypes.map(({ type }) => type);

const customTypeUnits: Record<string, KbqTimeRangeUnits> = Object.fromEntries(
    customTypes.map(({ type, units }) => [type, units])
);

const customTypeTranslation: Record<string, KbqTimeRangeTranslationType> = Object.fromEntries(
    customTypes.map(({ type, translationType }) => [type, translationType])
);

const ExampleLocalizedData = new InjectionToken<Record<string | 'default', string>>('ExampleLocalizedData', {
    factory: () => ({
        'ru-RU': 'Период',
        default: 'Period'
    })
});

/**
 * @title Time range custom range types
 */
@Component({
    selector: 'time-range-custom-range-types-example',
    imports: [
        ReactiveFormsModule,
        KbqTimeRangeModule,
        LuxonDateModule,
        KbqIconModule,
        KbqFormFieldModule
    ],
    template: `
        <ng-template #customOption let-context>
            {{ optionLabel(context.type) }}
        </ng-template>

        <ng-template #titleAsFormField let-context>
            <kbq-form-field>
                <kbq-time-range-title-as-control>
                    @if (!context.type) {
                        <span kbqTimeRangeTitlePlaceholder>{{ placeholder() }}</span>
                    } @else if (context.type === 'range') {
                        {{
                            dateFormatter.rangeShortDateTime(
                                dateAdapter.deserialize(context.startDateTime),
                                dateAdapter.deserialize(context.endDateTime)
                            )
                        }}
                    } @else {
                        {{ optionLabel(context.type) }}
                    }
                </kbq-time-range-title-as-control>
                <i kbq-icon="kbq-chevron-down-s_16" kbqSuffix [color]="'contrast-fade'"></i>
            </kbq-form-field>
        </ng-template>

        <kbq-time-range
            [titleTemplate]="titleAsFormField"
            [optionTemplate]="customOption"
            [arrow]="false"
            [nonNullable]="false"
        />
    `,
    providers: [
        { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] },
        { provide: KBQ_CUSTOM_TIME_RANGE_TYPES, useValue: customTypes },
        { provide: KBQ_DEFAULT_TIME_RANGE_TYPES, useValue: customDefaultTypes }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-flex layout-row layout-align-center-center layout-gap-3xl'
    }
})
export class TimeRangeCustomRangeTypesExample {
    protected readonly dateAdapter = inject(DateAdapter);
    protected readonly dateFormatter = inject(DateFormatter);

    private readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    private readonly localeId = toSignal(this.localeService?.changes || of(''));

    private readonly localeConfig = computed(() => {
        this.localeId();

        return this.localeService?.getParams('timeRange');
    });

    private readonly data = inject(ExampleLocalizedData);
    protected readonly placeholder = computed(() => this.data[this.localeId() || 'default'] ?? this.data.default);

    protected optionLabel(type: string): string {
        const localeConfig = this.localeConfig();

        if (!localeConfig) return type;

        const units = customTypeUnits[type];
        const translationType = customTypeTranslation[type];
        const startDate = this.dateAdapter.addCalendarUnits(this.dateAdapter.today(), units);

        return this.dateFormatter.duration(
            startDate,
            this.dateAdapter.today(),
            [translationType as Exclude<KbqTimeRangeTranslationType, 'other'>],
            false,
            localeConfig.durationTemplate.option
        );
    }
}

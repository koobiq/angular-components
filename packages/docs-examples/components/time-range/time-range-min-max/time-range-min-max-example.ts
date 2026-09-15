import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, InjectionToken } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE, KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTimeRangeModule, KbqTimeRangeRange } from '@koobiq/components/time-range';
import { DateTime } from 'luxon';
import { of } from 'rxjs';

type ExampleText = {
    placeholder: string;
    withPresets: string;
    withoutPresets: string;
};

const ExampleLocalizedData = new InjectionToken<Record<string | 'default', ExampleText>>('ExampleLocalizedData', {
    factory: () => ({
        'ru-RU': {
            placeholder: 'Выбрать период',
            withPresets: 'С предустановками',
            withoutPresets: 'Без предустановок'
        },
        default: {
            placeholder: 'Select period',
            withPresets: 'With presets',
            withoutPresets: 'Without presets'
        }
    })
});

/**
 * @title Time range min max
 */
@Component({
    selector: 'time-range-min-max-example',
    imports: [
        NgTemplateOutlet,
        ReactiveFormsModule,
        KbqTimeRangeModule,
        LuxonDateModule,
        KbqIconModule,
        KbqFormFieldModule
    ],
    template: `
        <ng-template #titleValue let-context>
            @if (!context.type) {
                <span kbqTimeRangeTitlePlaceholder>{{ text().placeholder }}</span>
            } @else if (context.type === 'range') {
                {{
                    dateFormatter.rangeLongDate(
                        dateAdapter.deserialize(context.startDateTime),
                        dateAdapter.deserialize(context.endDateTime)
                    )
                }}
            } @else {
                {{ capitalize(context.formattedDate) }}
            }
        </ng-template>

        <ng-template #withPresets let-context>
            <kbq-form-field>
                <kbq-label>{{ text().withPresets }}</kbq-label>
                <kbq-time-range-title-as-control>
                    <ng-container *ngTemplateOutlet="titleValue; context: { $implicit: context }" />
                </kbq-time-range-title-as-control>
                <i kbq-icon="kbq-chevron-down-s_16" kbqSuffix [color]="'contrast-fade'"></i>
            </kbq-form-field>
        </ng-template>

        <ng-template #withoutPresets let-context>
            <kbq-form-field>
                <kbq-label>{{ text().withoutPresets }}</kbq-label>
                <kbq-time-range-title-as-control>
                    <ng-container *ngTemplateOutlet="titleValue; context: { $implicit: context }" />
                </kbq-time-range-title-as-control>
                <i kbq-icon="kbq-chevron-down-s_16" kbqSuffix [color]="'contrast-fade'"></i>
            </kbq-form-field>
        </ng-template>

        <kbq-time-range
            [titleTemplate]="withPresets"
            [arrow]="false"
            [minDate]="minDate"
            [maxDate]="maxDate"
            [formControl]="control"
        />

        <!-- With the preset list empty the "range" option has no radio button to be captioned under, so
             the bounds move into the hint area of the "to" fieldset instead. -->
        <kbq-time-range
            [titleTemplate]="withoutPresets"
            [arrow]="false"
            [minDate]="minDate"
            [maxDate]="maxDate"
            [nonNullable]="false"
            [availableTimeRangeTypes]="[]"
        />
    `,
    providers: [
        { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-flex layout-row layout-align-center-center layout-gap-3xl'
    }
})
export class TimeRangeMinMaxExample {
    protected readonly dateAdapter = inject<DateAdapter<DateTime>>(DateAdapter);
    protected readonly dateFormatter = inject(DateFormatter);

    // Both bounds are exact instants, not whole days: a border is checked once its date and its time are
    // put together, so admitting the whole of 31 December means naming the end of that day.
    protected readonly minDate = this.dateAdapter.createDateTime(2017, 0, 1, 9, 0, 0, 0);
    protected readonly maxDate = this.dateAdapter.createDateTime(2017, 11, 31, 18, 30, 0, 0);

    // A manual range to start on, so that the "range" option is the one selected when the popover opens.
    protected readonly control = new FormControl<KbqTimeRangeRange>(
        {
            type: 'range',
            startDateTime: this.dateAdapter.toIso8601(this.dateAdapter.createDateTime(2017, 5, 1, 9, 0, 0, 0)),
            endDateTime: this.dateAdapter.toIso8601(this.dateAdapter.createDateTime(2017, 5, 15, 18, 0, 0, 0))
        },
        { nonNullable: true }
    );

    private readonly data = inject(ExampleLocalizedData);
    private readonly localeId = toSignal(inject(KBQ_LOCALE_SERVICE, { optional: true })?.changes || of(''));

    protected readonly text = computed(() => this.data[this.localeId() || 'default'] ?? this.data.default);

    protected capitalize(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
}

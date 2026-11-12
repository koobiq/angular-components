import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTimeRangeModule, KbqTimeRangeRange } from '@koobiq/components/time-range';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { DateTime } from 'luxon';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

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
                <span kbqTimeRangeTitlePlaceholder>{{ t().placeholder }}</span>
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
                <kbq-time-range-title-as-control>
                    <ng-container *ngTemplateOutlet="titleValue; context: { $implicit: context }" />
                </kbq-time-range-title-as-control>
                <i kbq-icon="kbq-chevron-down-s_16" kbqSuffix [color]="'contrast-fade'"></i>
                <kbq-hint>{{ t().withPresets }}</kbq-hint>
            </kbq-form-field>
        </ng-template>

        <ng-template #withoutPresets let-context>
            <kbq-form-field>
                <kbq-time-range-title-as-control>
                    <ng-container *ngTemplateOutlet="titleValue; context: { $implicit: context }" />
                </kbq-time-range-title-as-control>
                <i kbq-icon="kbq-chevron-down-s_16" kbqSuffix [color]="'contrast-fade'"></i>
                <kbq-hint>{{ t().withoutPresets }}</kbq-hint>
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
export class TimeRangeMinMaxExample extends BaseLocalizedExample<ExampleTranslation> {
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

    protected capitalize(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    constructor() {
        super(TRANSLATIONS);
    }
}

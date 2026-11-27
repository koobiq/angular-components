import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import type { DateTime } from 'luxon';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import {
    KBQ_DATETIME_MAX_ERROR,
    KBQ_DATETIME_MIN_ERROR,
    KBQ_DATETIME_PARSE_ERROR,
    KbqDatetime
} from '@koobiq/components/datetime';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Datetime validation
 */
@Component({
    selector: 'datetime-validation-example',
    imports: [ReactiveFormsModule, LuxonDateModule, KbqFormFieldModule, KbqDatepickerModule, KbqDatetime],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().label }}</kbq-label>
            <kbq-datetime #datetime [min]="min" [max]="max" [formControl]="control" />
            <kbq-cleaner />
            <kbq-datepicker-toggle-icon kbqSuffix [for]="datetime.datepicker()" />

            @if (control.hasError('required')) {
                <kbq-error>{{ t().required }}</kbq-error>
            }
            @if (control.hasError(parseError)) {
                <kbq-error>{{ t().incomplete }}</kbq-error>
            }
            @if (control.hasError(minError)) {
                <kbq-error>{{ t().notEarlier(adapter.format(min, format)) }}</kbq-error>
            }
            @if (control.hasError(maxError)) {
                <kbq-error>{{ t().notLater(adapter.format(max, format)) }}</kbq-error>
            }
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class DatetimeValidationExample {
    protected readonly adapter = inject<DateAdapter<DateTime>>(DateAdapter);

    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly parseError = KBQ_DATETIME_PARSE_ERROR;
    protected readonly minError = KBQ_DATETIME_MIN_ERROR;
    protected readonly maxError = KBQ_DATETIME_MAX_ERROR;
    protected readonly format = 'dd.MM.yyyy HH:mm';
    protected readonly min = this.adapter.createDateTime(2026, 10, 10, 9, 0, 0, 0);
    protected readonly max = this.adapter.createDateTime(2026, 10, 20, 18, 0, 0, 0);
    protected readonly control = new FormControl<DateTime | null>(
        this.adapter.createDateTime(2026, 10, 10, 8, 30, 0, 0),
        [
            Validators.required
        ]
    );

    constructor() {
        this.control.markAsTouched();
    }
}

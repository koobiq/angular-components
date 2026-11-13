import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import {
    KBQ_DATETIME_MAX_ERROR,
    KBQ_DATETIME_MIN_ERROR,
    KBQ_DATETIME_PARSE_ERROR,
    KbqDatetime
} from '@koobiq/components/datetime';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { DateTime } from 'luxon';

/**
 * @title Datetime validation
 */
@Component({
    selector: 'datetime-validation-example',
    imports: [ReactiveFormsModule, LuxonDateModule, KbqFormFieldModule, KbqDatepickerModule, KbqDatetime],
    template: `
        <kbq-form-field>
            <kbq-label>Maintenance start</kbq-label>
            <kbq-datetime #datetime [min]="min" [max]="max" [formControl]="control" />
            <kbq-datepicker-toggle-icon kbqSuffix [for]="datetime.datepicker()" />

            @if (control.hasError('required')) {
                <kbq-error>Required</kbq-error>
            }
            @if (control.hasError(parseError)) {
                <kbq-error>Enter both the date and the time</kbq-error>
            }
            @if (control.hasError(minError)) {
                <kbq-error>Not earlier than {{ min.toFormat(format) }}</kbq-error>
            }
            @if (control.hasError(maxError)) {
                <kbq-error>Not later than {{ max.toFormat(format) }}</kbq-error>
            }
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class DatetimeValidationExample {
    protected readonly parseError = KBQ_DATETIME_PARSE_ERROR;
    protected readonly minError = KBQ_DATETIME_MIN_ERROR;
    protected readonly maxError = KBQ_DATETIME_MAX_ERROR;

    protected readonly format = 'dd.MM.yyyy HH:mm';
    protected readonly min = DateTime.fromISO('2026-11-10T09:00');
    protected readonly max = DateTime.fromISO('2026-11-20T18:00');

    protected readonly control = new FormControl<DateTime | null>(DateTime.fromISO('2026-11-10T08:30'), [
        Validators.required
    ]);

    constructor() {
        this.control.markAsTouched();
    }
}

import { afterNextRender, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTimepickerModule, TimeFormats } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';

/** @title Timepicker field validation */
@Component({
    selector: 'timepicker-field-validation-example',
    imports: [KbqFormFieldModule, KbqTimepickerModule, ReactiveFormsModule, KbqIconModule, LuxonDateModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <i kbq-icon="kbq-clock_16" kbqPrefix></i>
            <input kbqTimepicker [max]="max" [min]="min" [formControl]="control" [format]="timeFormats.HHmm" />
            @if (control.hasError('required')) {
                <kbq-error>Required</kbq-error>
            }
            <!-- Component built-in validation -->
            @if (control.hasError('kbqTimepickerLowerThenMin')) {
                <kbq-error>Min is {{ min.toFormat(timeFormats.HHmm) }}</kbq-error>
            }
            <!-- Component built-in validation -->
            @if (control.hasError('kbqTimepickerHigherThenMax')) {
                <kbq-error>Maximum is {{ max.toFormat(timeFormats.HHmm) }}</kbq-error>
            }
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimepickerFieldValidationExample {
    private readonly adapter = inject(DateAdapter<DateTime>);
    protected readonly timeFormats = TimeFormats;

    protected readonly max = this.adapter.today().startOf('hour').plus({ hours: 1 });
    protected readonly min = this.adapter.today().startOf('hour').minus({ hours: 1 });

    protected readonly control = new FormControl<DateTime | null>(null, [Validators.required]);

    constructor() {
        afterNextRender(() => {
            this.control.markAsTouched();
            this.control.updateValueAndValidity();
        });
    }
}

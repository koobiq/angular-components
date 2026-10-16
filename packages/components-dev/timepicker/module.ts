import { JsonPipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqTimepickerModule, TimeFormats } from '@koobiq/components/timepicker';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DateTime } from 'luxon';
import { TimepickerFieldValidationExample } from 'packages/docs-examples/components/timepicker';
import { DevLocaleSelector } from '../locale-selector';

@Component({
    selector: 'dev-examples',
    imports: [TimepickerFieldValidationExample],
    template: `
        <timepicker-field-validation-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        FormsModule,
        KbqTimepickerModule,
        KbqDatepickerModule,
        KbqToolTipModule,
        KbqLuxonDateModule,
        ReactiveFormsModule,
        KbqRadioModule,
        JsonPipe,
        LowerCasePipe,
        DevLocaleSelector,
        KbqIcon,
        DevExamples
    ],
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {
    private adapter = inject<DateAdapter<DateTime>>(DateAdapter);

    timeFormats = TimeFormats;
    minDate: DateTime;
    maxDate: DateTime;

    reactiveFormControlValue: UntypedFormControl;

    ngModelValue: any;

    timeFormat = TimeFormats.HHmm;

    constructor() {
        this.minDate = this.adapter.createDateTime(2020, 0, 6, 12, 0, 10, 0);
        this.maxDate = this.adapter.createDateTime(2020, 0, 6, 13, 0, 10, 0);

        this.reactiveFormControlValue = new UntypedFormControl(this.adapter.createDateTime(2020, 0, 6, 12, 0, 10, 0));
        this.ngModelValue = this.adapter.createDateTime(2020, 0, 6, 12, 0, 10, 0);

        this.reactiveFormControlValue.valueChanges.subscribe((value) => {
            console.log('this.reactiveFormControlValue:', value);
        });
    }

    onTimepickerChange() {
        console.log('onTimepickerChange: ');
    }
}

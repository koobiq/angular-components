import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup
} from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
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
        KbqFormFieldModule,
        KbqLuxonDateModule,
        ReactiveFormsModule,
        KbqRadioModule,
        JsonPipe,
        DevLocaleSelector,
        KbqIcon,
        DevExamples
    ],
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    timeFormats = TimeFormats;
    placeholder: string = 'placeholder';
    minDate: DateTime;
    maxDate: DateTime;

    reactiveFormControlValue: UntypedFormControl;
    formControlValue: UntypedFormControl;

    ngModelValue: any;

    isDisabled: boolean = false;

    timeFormat = TimeFormats.HHmm;
    testForm: UntypedFormGroup;
    selectedLanguage!: { id: string; name: string };

    constructor(
        private fb: UntypedFormBuilder,
        private adapter: DateAdapter<DateTime>
    ) {
        this.minDate = this.adapter.createDateTime(2020, 0, 6, 12, 0, 10, 0);
        this.maxDate = this.adapter.createDateTime(2020, 0, 6, 13, 0, 10, 0);

        this.reactiveFormControlValue = new UntypedFormControl(this.adapter.createDateTime(2020, 0, 6, 12, 0, 10, 0));
        this.formControlValue = new UntypedFormControl(this.adapter.createDateTime(2020, 0, 6, 12, 0, 10, 0));
        this.ngModelValue = this.adapter.createDateTime(2020, 0, 6, 12, 0, 10, 0);

        this.testForm = this.fb.group({
            time: [this.adapter.createDateTime(2000, 10, 1, 12, 0, 10, 0)]
        });

        this.reactiveFormControlValue.valueChanges.subscribe((value) => {
            console.log('this.reactiveFormControlValue:', value);
        });
    }

    toggleDisable() {
        this.isDisabled = !this.isDisabled;
    }

    ngModelChange(value: any) {
        console.log('ngModelChange: ', value);
    }

    onTimepickerChange() {
        console.log('onTimepickerChange: ');
    }
}

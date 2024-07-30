import { Component, Inject, NgModule, ViewEncapsulation } from '@angular/core';
import {
    AbstractControl,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup,
    ValidatorFn
} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, KBQ_LOCALE_SERVICE, KbqLocaleService, KbqLocaleServiceModule } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqRadioChange, KbqRadioModule } from '@koobiq/components/radio';
import { KbqTimepickerModule, TimeFormats } from '@koobiq/components/timepicker';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DateTime } from 'luxon';

export function customValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => ({ customValidator: { value: control.value } });
}

@Component({
    selector: 'app',
    styleUrls: ['../main.scss', 'styles.scss'],
    templateUrl: 'template.html',
    encapsulation: ViewEncapsulation.None
})
export class TimepickerDemoComponent {
    TimeFormats = TimeFormats;
    placeholder: string = 'placeholder';
    minDate: DateTime;
    maxDate: DateTime;

    reactiveFormControlValue: UntypedFormControl;
    formControlValue: UntypedFormControl;

    ngModelValue: any;

    isDisabled: boolean = false;

    timeFormat = TimeFormats.HHmm;
    testForm: UntypedFormGroup;
    languageList: { id: string; name: string }[];
    selectedLanguage!: { id: string; name: string };

    constructor(
        private fb: UntypedFormBuilder,
        private adapter: DateAdapter<DateTime>,
        @Inject(KBQ_LOCALE_SERVICE) public localeService: KbqLocaleService
    ) {
        this.languageList = this.localeService.locales.items;
        this.selectedLanguage =
            this.languageList.find(({ id }) => id === this.localeService.id) || this.languageList[0];

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

    setLocale($event: KbqRadioChange) {
        this.selectedLanguage = $event.value;
        this.localeService.setLocale($event.value.id);
    }

    onTimepickerChange() {
        console.log('onTimepickerChange: ');
    }
}

@NgModule({
    declarations: [TimepickerDemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        KbqTimepickerModule,
        KbqDatepickerModule,
        KbqToolTipModule,
        KbqFormFieldModule,
        KbqLuxonDateModule,
        ReactiveFormsModule,
        KbqRadioModule,
        KbqLocaleServiceModule
    ],
    bootstrap: [TimepickerDemoComponent]
})
export class DemoModule {}

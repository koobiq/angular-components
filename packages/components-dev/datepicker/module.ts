import { AfterViewInit, Component, Inject, NgModule, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, KBQ_LOCALE_SERVICE, KbqLocaleService, KbqLocaleServiceModule } from '@koobiq/components/core';
import { KbqDatepicker, KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqRadioChange, KbqRadioModule } from '@koobiq/components/radio';
import { KbqTimepickerModule } from '@koobiq/components/timepicker';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DateTime } from 'luxon';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent implements AfterViewInit, OnInit {
    // date = this.adapter.createDate(2015, 1, 1);
    date = this.adapter.createDate(2015, 1, 1);
    formControlValue: UntypedFormControl;
    minDate;
    maxDate;
    startAt;

    languageList = [
        { id: 'ru-RU' },
        { id: 'en-US' },
        { id: 'pt-BR' },
        { id: 'es-LA' },
        { id: 'zh-CN' },
        { id: 'fa-IR' }];
    selectedLanguage: any = this.languageList[0];

    @ViewChild(KbqDatepicker) datepicker: KbqDatepicker<any>;

    constructor(
        private adapter: DateAdapter<DateTime>,
        @Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService
    ) {
        this.formControlValue = new UntypedFormControl(this.adapter.createDateTime(2021, 8, 11, 12, 0, 0, 0));
        this.formControlValue.valueChanges.subscribe((value) => {
            console.log('this.formControlValue.valueChanges: ', value?.toString());
        });

        this.startAt = this.adapter.createDate(2000, 1, 1);
        this.minDate = this.adapter.createDate(2015, 1, 1);
        this.maxDate = this.adapter.createDate(2025, 0, 5);
    }

    ngOnInit() {
        this.adapter.setLocale(this.languageList[0].id);
    }

    setFormat($event: KbqRadioChange): void {
        this.selectedLanguage = this.languageList.find(({ id }) => id === $event.value.id);

        this.formControlValue.setValue(this.formControlValue.value);

        this.localeService.setLocale($event.value.id);
        this.adapter.setLocale($event.value.id);
    }

    myFilter(date: DateTime): boolean {
        return date.day !== 0 && date.day !== 6;
    }

    ngAfterViewInit(): void {
        this.datepicker.selectedChanged.subscribe(() => {
            console.log('this.datepicker.selectedChanged');
        });
    }

    onDateChange() {
        console.log('onDateChange: ');
    }

    onDateInput() {
        console.log('onDateInput: ');
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        KbqLocaleServiceModule,
        KbqFormFieldModule,
        KbqToolTipModule,
        KbqDatepickerModule,
        KbqTimepickerModule,
        KbqLuxonDateModule,
        KbqInputModule,
        KbqIconModule,
        KbqRadioModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}

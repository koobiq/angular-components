import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, KbqFormsModule } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { DateTime } from 'luxon';

/**
 * @title Datepicker inactive
 */
@Component({
    standalone: true,
    selector: 'datepicker-inactive-example',
    imports: [
        KbqDatepickerModule,
        KbqFormFieldModule,
        FormsModule,
        LuxonDateModule,
        KbqFormsModule
    ],
    template: `
        <div class="docs-example__datepicker-inactive kbq-form-vertical">
            <div class="kbq-form__row">
                <label class="kbq-form__label">Пустое неактивное поле</label>
                <kbq-form-field style="width: 136px">
                    <input [disabled]="true" [kbqDatepicker]="emptyDatepicker" [placeholder]="''" />
                    <i kbq-icon="kbq-calendar-o_16" kbqSuffix></i>
                    <kbq-datepicker #emptyDatepicker />
                </kbq-form-field>
            </div>

            <br />

            <div class="kbq-form__row">
                <label class="kbq-form__label">Заполненное неактивное поле</label>
                <kbq-form-field style="width: 136px">
                    <input [disabled]="true" [kbqDatepicker]="datepicker" [ngModel]="selectedDate" />
                    <i kbq-icon="kbq-calendar-o_16" kbqSuffix></i>
                    <kbq-datepicker #datepicker />
                </kbq-form-field>
            </div>
        </div>
    `
})
export class DatepickerInactiveExample {
    selectedDate: DateTime;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.selectedDate = this.adapter.createDate(1989, 11, 13);
    }
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTimepickerModule } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';

/**
 * @title Datepicker and timepicker
 */
@Component({
    standalone: true,
    selector: 'datepicker-and-timepicker-example',
    imports: [
        KbqTimepickerModule,
        KbqDatepickerModule,
        KbqFormFieldModule,
        FormsModule,
        LuxonDateModule
    ],
    template: `
        <div class="docs-example__datepicker-and-timepicker">
            <div class="kbq-form-vertical">
                <label class="kbq-form__label">Время выпуска пакета</label>
                <div class="kbq-form__row">
                    <div>
                        <kbq-form-field
                            class="layout-margin-right-s"
                            (click)="datepicker.toggle()"
                            style="width: 136px"
                        >
                            <input [kbqDatepicker]="datepicker" [ngModel]="selectedDateTime" />
                            <i kbq-icon="kbq-calendar-o_16" kbqSuffix></i>
                            <kbq-datepicker #datepicker />
                        </kbq-form-field>

                        <kbq-form-field style="width: 136px">
                            <i kbq-icon="kbq-clock_16" kbqPrefix></i>
                            <input [ngModel]="selectedDateTime" kbqTimepicker />
                        </kbq-form-field>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class DatepickerAndTimepickerExample {
    selectedDateTime: DateTime;
}

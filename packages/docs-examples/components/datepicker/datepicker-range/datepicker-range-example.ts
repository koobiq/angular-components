import { Component } from '@angular/core';
import { DateAdapter } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { DateTime } from 'luxon';

/**
 * @title Datepicker range
 */
@Component({
    standalone: true,
    selector: 'datepicker-range-example',
    imports: [
        KbqDatepickerModule,
        KbqFormFieldModule,
        KbqIconModule
    ],
    template: `
        <div class="docs-example__datepicker-range">
            <div class="kbq-form-vertical">
                <div class="kbq-form__row">
                    <label class="kbq-form__label">Начало и конец отпуска:</label>
                    <div>
                        <kbq-form-field
                            class="layout-margin-right-s"
                            (click)="datepicker.toggle()"
                            style="width: 136px"
                        >
                            <input [kbqDatepicker]="datepicker" />
                            <i
                                kbq-icon="kbq-calendar-o_16"
                                kbqSuffix
                            ></i>
                            <kbq-datepicker #datepicker />
                        </kbq-form-field>

                        <kbq-form-field
                            (click)="datepicker2.toggle()"
                            style="width: 136px"
                        >
                            <input [kbqDatepicker]="datepicker2" />
                            <i
                                kbq-icon="kbq-calendar-o_16"
                                kbqSuffix
                            ></i>
                            <kbq-datepicker #datepicker2 />
                        </kbq-form-field>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class DatepickerRangeExample {
    minDate: DateTime;
    maxDate: DateTime;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.minDate = this.adapter.createDate(2023, 11, 14);
        this.maxDate = this.adapter.createDate(2024, 7, 25);
    }
}

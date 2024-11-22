import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, KbqFormsModule } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DateTime } from 'luxon';

/**
 * @title Datepicker minimax
 */
@Component({
    standalone: true,
    selector: 'datepicker-minimax-example',
    imports: [
        KbqDatepickerModule,
        KbqFormFieldModule,
        FormsModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqFormsModule,
        LuxonDateModule
    ],
    template: `
        <div class="docs-example__datepicker-minimax">
            <div class="kbq-form-vertical">
                <div class="kbq-form__row">
                    <label class="kbq-form__label">Выберите дату от 14 декабря 2023 до 25 августа 2024</label>
                    <kbq-form-field
                        #tooltip="kbqWarningTooltip"
                        [kbqWarningTooltip]="'Только цифры'"
                        (click)="datepicker.toggle()"
                        style="width: 136px"
                    >
                        <input
                            [kbqDatepicker]="datepicker"
                            [kbqValidationTooltip]="tooltip"
                            [max]="maxDate"
                            [min]="minDate"
                        />
                        <i kbq-icon="kbq-calendar-o_16" kbqSuffix></i>
                        <kbq-datepicker #datepicker [maxDate]="maxDate" [minDate]="minDate" />
                    </kbq-form-field>
                </div>
            </div>
        </div>
    `
})
export class DatepickerMinimaxExample {
    minDate: DateTime;
    maxDate: DateTime;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.minDate = this.adapter.createDate(2023, 11, 14);
        this.maxDate = this.adapter.createDate(2024, 7, 25);
    }
}

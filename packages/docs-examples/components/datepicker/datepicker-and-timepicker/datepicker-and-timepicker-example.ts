import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTimepickerModule } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';

/**
 * @title Datepicker and timepicker
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'datepicker-and-timepicker-example',
    imports: [
        KbqTimepickerModule,
        KbqDatepickerModule,
        KbqFormFieldModule,
        FormsModule,
        LuxonDateModule,
        KbqFormsModule,
        KbqIconModule
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
                            <i
                                [autoColor]="true"
                                [tabindex]="-1"
                                [class.kbq-active]="datepicker.opened"
                                kbq-icon-button="kbq-calendar-o_16"
                                color="contrast-fade"
                                kbqSuffix
                            ></i>
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

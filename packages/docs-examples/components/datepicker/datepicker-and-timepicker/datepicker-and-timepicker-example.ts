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
    selector: 'datepicker-and-timepicker-example',
    imports: [
        FormsModule,
        LuxonDateModule,
        KbqTimepickerModule,
        KbqDatepickerModule,
        KbqFormFieldModule,
        KbqFormsModule,
        KbqIconModule
    ],
    template: `
        <div class="docs-example__datepicker-and-timepicker">
            <div class="kbq-form-vertical">
                <label class="kbq-form__label">Package release date and time</label>
                <div class="kbq-form__row">
                    <div>
                        <kbq-form-field class="layout-margin-right-s" (click)="datepicker.toggle()">
                            <input [kbqDatepicker]="datepicker" [ngModel]="selectedDateTime" />
                            <kbq-datepicker-toggle-icon kbqSuffix [for]="datepicker" />
                            <kbq-datepicker #datepicker />
                        </kbq-form-field>

                        <kbq-form-field>
                            <i kbq-icon="kbq-clock_16" kbqPrefix></i>
                            <input kbqTimepicker [ngModel]="selectedDateTime" />
                        </kbq-form-field>
                    </div>
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatepickerAndTimepickerExample {
    selectedDateTime: DateTime;
}

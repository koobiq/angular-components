import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { DateTime } from 'luxon';

/**
 * @title Datepicker required
 */
@Component({
    standalone: true,
    selector: 'datepicker-required-example',
    imports: [
        KbqDatepickerModule,
        KbqFormFieldModule,
        KbqIconModule,
        FormsModule,
        LuxonDateModule
    ],
    template: `
        <div class="docs-example__datepicker-required">
            <kbq-form-field
                (click)="datepicker.toggle()"
                style="width: 136px"
            >
                <input
                    [kbqDatepicker]="datepicker"
                    [ngModel]="date"
                    [required]="true"
                />
                <i
                    kbq-icon="kbq-calendar-o_16"
                    kbqSuffix
                ></i>
                <kbq-datepicker #datepicker />
            </kbq-form-field>
        </div>
    `
})
export class DatepickerRequiredExample {
    date: DateTime;
}

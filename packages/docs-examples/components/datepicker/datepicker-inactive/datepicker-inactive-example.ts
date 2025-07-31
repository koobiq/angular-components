import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, KbqFormsModule } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { DateTime } from 'luxon';

/**
 * @title Datepicker inactive
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'datepicker-inactive-example',
    imports: [
        FormsModule,
        LuxonDateModule,
        KbqDatepickerModule,
        KbqFormFieldModule,
        KbqFormsModule,
        KbqIconModule
    ],
    template: `
        <div class="docs-example__datepicker-inactive kbq-form-vertical">
            <div class="kbq-form__row">
                <label class="kbq-form__label">Disabled empty field</label>
                <kbq-form-field>
                    <input [disabled]="true" [kbqDatepicker]="emptyDatepicker" [placeholder]="''" />
                    <kbq-datepicker-toggle-icon kbqSuffix [for]="emptyDatepicker" />
                    <kbq-datepicker #emptyDatepicker />
                </kbq-form-field>
            </div>

            <br />

            <div class="kbq-form__row">
                <label class="kbq-form__label">Read-only field with data</label>
                <kbq-form-field>
                    <input [disabled]="true" [kbqDatepicker]="datepicker" [ngModel]="selectedDate" />
                    <kbq-datepicker-toggle-icon kbqSuffix [for]="datepicker" />
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

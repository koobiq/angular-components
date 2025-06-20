import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, KbqFormsModule } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { DateTime } from 'luxon';

/**
 * @title Datepicker range
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'datepicker-range-example',
    imports: [
        LuxonDateModule,
        KbqDatepickerModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqFormsModule
    ],
    template: `
        <div class="docs-example__datepicker-range">
            <div class="kbq-form-vertical">
                <div class="kbq-form__row">
                    <label class="kbq-form__label">Vacation period:</label>
                    <div>
                        <kbq-form-field
                            class="layout-margin-right-s"
                            (click)="datepicker.toggle()"
                            style="width: 136px"
                        >
                            <input [kbqDatepicker]="datepicker" />
                            <kbq-datepicker-toggle-icon [for]="datepicker" kbqSuffix />
                            <kbq-datepicker #datepicker />
                        </kbq-form-field>

                        <kbq-form-field (click)="datepicker2.toggle()" style="width: 136px">
                            <input [kbqDatepicker]="datepicker2" />
                            <kbq-datepicker-toggle-icon [for]="datepicker2" kbqSuffix />
                            <kbq-datepicker #datepicker2 />
                        </kbq-form-field>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class DatepickerRangeExample {
    readonly minDate = this.adapter.createDate(2023, 11, 14);
    readonly maxDate = this.adapter.createDate(2024, 7, 25);

    constructor(private adapter: DateAdapter<DateTime>) {}
}

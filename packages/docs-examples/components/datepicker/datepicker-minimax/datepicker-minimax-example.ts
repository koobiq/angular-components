import { ChangeDetectionStrategy, Component } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'datepicker-minimax-example',
    imports: [
        FormsModule,
        LuxonDateModule,
        KbqDatepickerModule,
        KbqFormFieldModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqFormsModule
    ],
    template: `
        <div class="docs-example__datepicker-minimax">
            <div class="kbq-form-vertical">
                <div class="kbq-form__row">
                    <label class="kbq-form__label">Select a date between December 14, 2023, and August 25, 2024.</label>
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
                        <kbq-datepicker-toggle-icon [for]="datepicker" kbqSuffix />
                        <kbq-datepicker #datepicker [maxDate]="maxDate" [minDate]="minDate" />
                    </kbq-form-field>
                </div>
            </div>
        </div>
    `
})
export class DatepickerMinimaxExample {
    readonly minDate = this.adapter.createDate(2023, 11, 14);
    readonly maxDate = this.adapter.createDate(2024, 7, 25);

    constructor(private adapter: DateAdapter<DateTime>) {}
}

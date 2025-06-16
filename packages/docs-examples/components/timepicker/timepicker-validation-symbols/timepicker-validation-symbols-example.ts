import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTimepickerModule, TimeFormats } from '@koobiq/components/timepicker';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DateTime } from 'luxon';

/**
 * @title Timepicker validation symbols
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'timepicker-validation-symbols-example',
    imports: [KbqFormFieldModule, KbqToolTipModule, KbqIconModule, FormsModule, KbqTimepickerModule, LuxonDateModule],
    template: `
        <div class="docs-row">
            <kbq-form-field #tooltip="kbqWarningTooltip" [kbqWarningTooltip]="'Только цифры'">
                <i kbq-icon="kbq-clock_16" kbqPrefix></i>
                <input [(ngModel)]="time" [format]="timeFormats.HHmm" [kbqValidationTooltip]="tooltip" kbqTimepicker />
            </kbq-form-field>
        </div>
    `
})
export class TimepickerValidationSymbolsExample {
    timeFormats = TimeFormats;

    time: DateTime;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.time = this.adapter.today().startOf('hour');
    }
}

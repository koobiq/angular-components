import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqTimepickerModule, TimeFormats } from '@koobiq/components/timepicker';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DateTime } from 'luxon';

/**
 * @title Timepicker variations
 */
@Component({
    selector: 'timepicker-variations-example',
    imports: [
        KbqRadioModule,
        FormsModule,
        KbqFormFieldModule,
        KbqToolTipModule,
        KbqTimepickerModule,
        KbqIconModule,
        LuxonDateModule
    ],
    templateUrl: 'timepicker-variations-example.html',
    styleUrls: ['timepicker-variations-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimepickerVariationsExample {
    value: DateTime;

    timeFormat = TimeFormats.HHmm;
    protected readonly TimeFormats = TimeFormats;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.value = this.adapter.today();
    }
}

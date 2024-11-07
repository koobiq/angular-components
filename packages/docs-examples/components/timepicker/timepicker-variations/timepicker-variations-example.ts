import { Component } from '@angular/core';
import { DateAdapter } from '@koobiq/components/core';
import { KbqTimepickerModule, TimeFormats } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';
import { KbqRadioModule } from '@koobiq/components/radio';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Timepicker variations
 */
@Component({
    standalone: true,
    selector: 'timepicker-variations-example',
    templateUrl: 'timepicker-variations-example.html',
    imports: [
        KbqRadioModule,
        FormsModule,
        KbqFormFieldModule,
        KbqToolTipModule,
        KbqTimepickerModule,
        KbqIconModule
    ],
    styleUrls: ['timepicker-variations-example.css']
})
export class TimepickerVariationsExample {
    value: DateTime;

    timeFormat = TimeFormats.HHmm;
    protected readonly TimeFormats = TimeFormats;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.value = this.adapter.today();
    }
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { DateAdapter } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTimepickerModule, TimeFormats } from '@koobiq/components/timepicker';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DateTime } from 'luxon';

/**
 * @title Timepicker
 */
@Component({
    standalone: true,
    selector: 'timepicker-overview-example',
    templateUrl: 'timepicker-overview-example.html',
    styleUrls: ['timepicker-overview-example.css'],
    imports: [
        KbqFormFieldModule,
        KbqSelectModule,
        KbqRadioModule,
        KbqCheckboxModule,
        FormsModule,
        KbqToolTipModule,
        KbqTimepickerModule,
        KbqIconModule
    ]
})
export class TimepickerOverviewExample {
    isDisabled = false;
    isIconVisible = true;

    value: DateTime;

    timeFormat = TimeFormats.HHmm;
    protected readonly TimeFormats = TimeFormats;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.value = this.adapter.today();
    }
}

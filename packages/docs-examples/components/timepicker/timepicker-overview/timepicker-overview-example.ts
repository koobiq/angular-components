import { Component } from '@angular/core';
import { DateAdapter } from '@koobiq/components/core';
import { TimeFormats } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';

/**
 * @title Timepicker overview
 */
@Component({
    selector: 'timepicker-overview-example',
    templateUrl: 'timepicker-overview-example.html',
    styleUrls: ['timepicker-overview-example.css']
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

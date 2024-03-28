import { Component } from '@angular/core';
import { DateAdapter } from '@koobiq/components/core';
import { TimeFormats } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';


/**
 * @title Timepicker overview
 */
@Component({
    selector: 'timepicker-variations-example',
    templateUrl: 'timepicker-variations-example.html',
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

import { Component } from '@angular/core';
import { DateAdapter } from '@koobiq/components/core';
import { DateTime } from 'luxon';

/**
 * @title datepicker-range
 */
@Component({
    selector: 'datepicker-range-example',
    templateUrl: 'datepicker-range-example.html',
    styleUrls: ['datepicker-range-example.css']
})
export class DatepickerRangeExample {
    minDate: DateTime;
    maxDate: DateTime;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.minDate = this.adapter.createDate(2023, 11, 14);
        this.maxDate = this.adapter.createDate(2024, 7, 25);
    }
}

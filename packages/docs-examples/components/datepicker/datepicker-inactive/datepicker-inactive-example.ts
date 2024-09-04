import { Component } from '@angular/core';
import { DateAdapter } from '@koobiq/components/core';
import { DateTime } from 'luxon';

/**
 * @title datepicker-inactive
 */
@Component({
    selector: 'datepicker-inactive-example',
    templateUrl: 'datepicker-inactive-example.html',
    styleUrls: ['datepicker-inactive-example.css']
})
export class DatepickerInactiveExample {
    selectedDate: DateTime;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.selectedDate = this.adapter.createDate(1989, 11, 13);
    }
}

import { Component } from '@angular/core';
import { DateTime } from 'luxon';

/**
 * @title datepicker-and-timepicker
 */
@Component({
    selector: 'datepicker-and-timepicker-example',
    templateUrl: 'datepicker-and-timepicker-example.html',
    styleUrls: ['datepicker-and-timepicker-example.css']
})
export class DatepickerAndTimepickerExample {
    selectedDateTime: DateTime;
}

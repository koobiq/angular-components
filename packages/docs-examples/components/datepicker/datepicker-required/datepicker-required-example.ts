import { Component } from '@angular/core';
import { DateTime } from 'luxon';

/**
 * @title datepicker-required
 */
@Component({
    selector: 'datepicker-required-example',
    templateUrl: 'datepicker-required-example.html',
    styleUrls: ['datepicker-required-example.css']
})
export class DatepickerRequiredExample {
    date: DateTime;
}

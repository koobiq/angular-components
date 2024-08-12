import { Component } from '@angular/core';
import { DateAdapter } from '@koobiq/components/core';
import { DateTime } from 'luxon';

/**
 * @title Datepicker-minimax
 */
@Component({
    selector: 'datepicker-minimax-example',
    templateUrl: 'datepicker-minimax-example.html',
    styleUrls: ['datepicker-minimax-example.css']
})
export class DatepickerMinimaxExample {
    minDate: DateTime;
    maxDate: DateTime;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.minDate = this.adapter.createDate(2023, 11, 14);
        this.maxDate = this.adapter.createDate(2024, 7, 25);
    }
}

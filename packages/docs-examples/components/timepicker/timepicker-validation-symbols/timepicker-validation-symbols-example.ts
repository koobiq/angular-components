import { Component  } from '@angular/core';
import { DateAdapter } from '@koobiq/components/core';
import { TimeFormats } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';


/**
 * @title Timepicker overview
 */
@Component({
    selector: 'timepicker-validation-symbols-example',
    templateUrl: 'timepicker-validation-symbols-example.html',
    styleUrls: ['timepicker-validation-symbols-example.css']
})
export class TimepickerValidationSymbolsExample {
    timeFormats = TimeFormats;

    time: DateTime;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.time = this.adapter.today().startOf('hour');
    }
}

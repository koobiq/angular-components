import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateAdapter } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTimepickerModule } from '@koobiq/components/timepicker';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DateTime } from 'luxon';

/**
 * @title Timepicker range
 */
@Component({
    standalone: true,
    selector: 'timepicker-range-example',
    templateUrl: 'timepicker-range-example.html',
    styleUrls: ['timepicker-range-example.css'],
    imports: [KbqFormFieldModule, KbqToolTipModule, KbqTimepickerModule, FormsModule, KbqInputModule]
})
export class TimepickerRangeExample {
    format = 'HH:mm:ss';

    startTime: DateTime;
    endTime: DateTime;
    time: DateTime;

    constructor(private adapter: DateAdapter<DateTime>) {
        this.startTime = this.adapter.today().startOf('day');
        this.endTime = this.adapter.today();
        this.time = this.adapter.today().startOf('hour');
    }

    getStartTime() {
        return this.startTime ? this.startTime.toFormat(this.format) : '';
    }

    getEndTime() {
        return this.endTime ? this.endTime.toFormat(this.format) : '';
    }
}

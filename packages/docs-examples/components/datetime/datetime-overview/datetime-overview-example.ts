import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqDatetime } from '@koobiq/components/datetime';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { DateTime } from 'luxon';

/**
 * @title Datetime
 */
@Component({
    selector: 'datetime-overview-example',
    imports: [FormsModule, LuxonDateModule, KbqFormFieldModule, KbqDatepickerModule, KbqDatetime],
    template: `
        <kbq-form-field>
            <kbq-label>Release date and time</kbq-label>
            <kbq-datetime #datetime [(ngModel)]="value" />
            <kbq-datepicker-toggle-icon kbqSuffix [for]="datetime.datepicker()" />
            <kbq-hint>In your local time zone</kbq-hint>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class DatetimeOverviewExample {
    protected readonly value = model<DateTime | null>(null);
}

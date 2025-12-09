import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import { DateTime } from 'luxon';
import { KbqDatepickerModule } from './datepicker-module';

@Component({
    selector: 'e2e-datepicker-states',
    imports: [KbqDatepickerModule, FormsModule, KbqLuxonDateModule],
    template: `
        <div data-testid="e2eScreenshotTarget" style="width: 330px; height: 340px;">
            <kbq-form-field>
                <input [kbqDatepicker]="myDatepicker1" [(ngModel)]="date" />
                <kbq-datepicker-toggle-icon kbqSuffix data-testid="e2eDatepickerToggle" [for]="myDatepicker1" />
                <kbq-datepicker #myDatepicker1 [startAt]="date" />
            </kbq-form-field>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eDatepickerStates'
    }
})
export class E2eDatepickerStates {
    adapter = inject(DateAdapter<DateTime>);

    date = this.adapter.createDate(2025, 11, 9);
}

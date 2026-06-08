import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTimepickerModule, TimeFormats } from '@koobiq/components/timepicker';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DateTime } from 'luxon';

/**
 * @title Timepicker validation symbols
 */
@Component({
    selector: 'timepicker-overview-example',
    imports: [KbqToolTipModule, KbqIconModule, FormsModule, KbqTimepickerModule, LuxonDateModule],
    template: `
        <div class="docs-row">
            <kbq-form-field #tooltip="kbqTooltip" kbqTooltipModifier="warning" [kbqTooltip]="'Только цифры'">
                <i kbq-icon="kbq-clock_16" kbqPrefix></i>
                <input kbqTimepicker [format]="timeFormats.HHmm" [kbqValidationTooltip]="tooltip" [(ngModel)]="time" />
            </kbq-form-field>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimepickerOverviewExample {
    private adapter = inject<DateAdapter<DateTime>>(DateAdapter);

    timeFormats = TimeFormats;

    time: DateTime;

    constructor() {
        this.time = this.adapter.today().startOf('hour');
    }
}

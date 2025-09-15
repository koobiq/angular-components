import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqTimeRange } from '@koobiq/components/time-range';

/**
 * @title Time range overview
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'time-range-overview-example',
    imports: [
        KbqTimeRange,
        KbqLuxonDateModule
    ],
    template: `
        <kbq-time-range />
    `
})
export class TimeRangeOverviewExample {}

import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * @title Time range overview
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'time-range-overview-example',
    imports: [],
    template: `
        hello world
    `
})
export class TimeRangeOverviewExample {}

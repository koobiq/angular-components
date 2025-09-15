import { NgModule } from '@angular/core';
import { TimeRangeOverviewExample } from './time-range-overview/time-range-overview-example';

export { TimeRangeOverviewExample };

const EXAMPLES = [
    TimeRangeOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TimeRangeExamplesModule {}

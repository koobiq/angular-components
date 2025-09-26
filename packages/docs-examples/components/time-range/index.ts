import { NgModule } from '@angular/core';
import { TimeRangeCustomTriggerExample } from './time-range-custom-trigger/time-range-custom-trigger-example';
import { TimeRangeEmptyTypeListExample } from './time-range-empty-type-list/time-range-empty-type-list-example';
import { TimeRangeMinMaxExample } from './time-range-min-max/time-range-min-max-example';
import { TimeRangeOverviewExample } from './time-range-overview/time-range-overview-example';

export {
    TimeRangeCustomTriggerExample,
    TimeRangeEmptyTypeListExample,
    TimeRangeMinMaxExample,
    TimeRangeOverviewExample
};

const EXAMPLES = [
    TimeRangeOverviewExample,
    TimeRangeCustomTriggerExample,
    TimeRangeEmptyTypeListExample,
    TimeRangeMinMaxExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TimeRangeExamplesModule {}

import { NgModule } from '@angular/core';
import { TimeRangeAsFormFieldExample } from './time-range-as-form-field/time-range-as-form-field-example';
import { TimeRangeCustomTriggerExample } from './time-range-custom-trigger/time-range-custom-trigger-example';
import { TimeRangeEmptyTypeListExample } from './time-range-empty-type-list/time-range-empty-type-list-example';
import { TimeRangeMinMaxExample } from './time-range-min-max/time-range-min-max-example';
import { TimeRangeOverviewExample } from './time-range-overview/time-range-overview-example';

export {
    TimeRangeAsFormFieldExample,
    TimeRangeCustomTriggerExample,
    TimeRangeEmptyTypeListExample,
    TimeRangeMinMaxExample,
    TimeRangeOverviewExample
};

const EXAMPLES = [
    TimeRangeOverviewExample,
    TimeRangeCustomTriggerExample,
    TimeRangeEmptyTypeListExample,
    TimeRangeMinMaxExample,
    TimeRangeAsFormFieldExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TimeRangeExamplesModule {}

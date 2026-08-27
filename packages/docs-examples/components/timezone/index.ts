import { NgModule } from '@angular/core';
import { TimezoneOverviewExample } from './timezone-overview/timezone-overview-example';
import { TimezoneSearchOverviewExample } from './timezone-search-overview/timezone-search-overview-example';
import { TimezoneSearchSimpleExample } from './timezone-search-simple/timezone-search-simple-example';
import { TimezoneTriggerOverviewExample } from './timezone-trigger-overview/timezone-trigger-overview-example';

export {
    TimezoneOverviewExample,
    TimezoneSearchOverviewExample,
    TimezoneSearchSimpleExample,
    TimezoneTriggerOverviewExample
};

const EXAMPLES = [
    TimezoneOverviewExample,
    TimezoneSearchOverviewExample,
    TimezoneSearchSimpleExample,
    TimezoneTriggerOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TimezoneExamplesModule {}

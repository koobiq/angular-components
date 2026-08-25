import { NgModule } from '@angular/core';
import { TimezoneOverviewExample } from './timezone-overview/timezone-overview-example';
import { TimezoneSearchOverviewExample } from './timezone-search-overview/timezone-search-overview-example';
import { TimezoneSearchSmartExample } from './timezone-search-smart/timezone-search-smart-example';
import { TimezoneTriggerOverviewExample } from './timezone-trigger-overview/timezone-trigger-overview-example';

export {
    TimezoneOverviewExample,
    TimezoneSearchOverviewExample,
    TimezoneSearchSmartExample,
    TimezoneTriggerOverviewExample
};

const EXAMPLES = [
    TimezoneOverviewExample,
    TimezoneSearchOverviewExample,
    TimezoneSearchSmartExample,
    TimezoneTriggerOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TimezoneExamplesModule {}

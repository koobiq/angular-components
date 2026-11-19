import { NgModule } from '@angular/core';
import { DatetimeOverviewExample } from './datetime-overview/datetime-overview-example';
import { DatetimeValidationExample } from './datetime-validation/datetime-validation-example';
import { DatetimeWithSecondsExample } from './datetime-with-seconds/datetime-with-seconds-example';

export { DatetimeOverviewExample, DatetimeValidationExample, DatetimeWithSecondsExample };

const EXAMPLES = [
    DatetimeOverviewExample,
    DatetimeValidationExample,
    DatetimeWithSecondsExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class DatetimeExamplesModule {}

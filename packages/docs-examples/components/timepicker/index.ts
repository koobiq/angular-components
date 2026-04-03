import { NgModule } from '@angular/core';
import { TimepickerFieldValidationExample } from './timepicker-field-validation/timepicker-field-validation-example';
import { TimepickerOverviewExample } from './timepicker-overview/timepicker-overview-example';
import { TimepickerVariationsExample } from './timepicker-variations/timepicker-variations-example';

export { TimepickerFieldValidationExample, TimepickerOverviewExample, TimepickerVariationsExample };

const EXAMPLES = [
    TimepickerVariationsExample,
    TimepickerOverviewExample,
    TimepickerFieldValidationExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TimepickerExamplesModule {}

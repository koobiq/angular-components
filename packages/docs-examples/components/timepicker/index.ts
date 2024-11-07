import { NgModule } from '@angular/core';
import { TimepickerOverviewExample } from './timepicker-overview/timepicker-overview-example';
import { TimepickerRangeExample } from './timepicker-range/timepicker-range-example';
import { TimepickerValidationSymbolsExample } from './timepicker-validation-symbols/timepicker-validation-symbols-example';
import { TimepickerVariationsExample } from './timepicker-variations/timepicker-variations-example';

export {
    TimepickerOverviewExample,
    TimepickerRangeExample,
    TimepickerValidationSymbolsExample,
    TimepickerVariationsExample
};

const EXAMPLES = [
    TimepickerOverviewExample,
    TimepickerRangeExample,
    TimepickerVariationsExample,
    TimepickerValidationSymbolsExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TimepickerExamplesModule {}

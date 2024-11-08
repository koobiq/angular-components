import { NgModule } from '@angular/core';
import { TimepickerValidationSymbolsExample } from './timepicker-validation-symbols/timepicker-validation-symbols-example';
import { TimepickerVariationsExample } from './timepicker-variations/timepicker-variations-example';

export { TimepickerValidationSymbolsExample, TimepickerVariationsExample };

const EXAMPLES = [
    TimepickerVariationsExample,
    TimepickerValidationSymbolsExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TimepickerExamplesModule {}

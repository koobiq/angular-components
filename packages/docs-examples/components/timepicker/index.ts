import { NgModule } from '@angular/core';
import { TimepickerFieldValidationExample } from './timepicker-field-validation/timepicker-field-validation-example';
import { TimepickerValidationSymbolsExample } from './timepicker-validation-symbols/timepicker-validation-symbols-example';
import { TimepickerVariationsExample } from './timepicker-variations/timepicker-variations-example';

export { TimepickerFieldValidationExample, TimepickerValidationSymbolsExample, TimepickerVariationsExample };

const EXAMPLES = [
    TimepickerVariationsExample,
    TimepickerValidationSymbolsExample,
    TimepickerFieldValidationExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TimepickerExamplesModule {}

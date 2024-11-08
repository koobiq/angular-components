import { NgModule } from '@angular/core';
import { ValidationCompositeExample } from './validation-composite/validation-composite-example';
import { ValidationGlobalOneRequiredExample } from './validation-global-one-required/validation-global-one-required-example';
import { ValidationGlobalExample } from './validation-global/validation-global-example';
import { ValidationOnBlurExample } from './validation-on-blur/validation-on-blur-example';
import { ValidationOnTypeExample } from './validation-on-type/validation-on-type-example';
import { ValidationOverviewExample } from './validation-overview/validation-overview-example';
import { ValidationSmallExample } from './validation-small/validation-small-example';

export {
    ValidationCompositeExample,
    ValidationGlobalExample,
    ValidationGlobalOneRequiredExample,
    ValidationOnBlurExample,
    ValidationOnTypeExample,
    ValidationOverviewExample,
    ValidationSmallExample
};

const EXAMPLES = [
    ValidationOverviewExample,
    ValidationCompositeExample,
    ValidationGlobalExample,
    ValidationOnBlurExample,
    ValidationOnTypeExample,
    ValidationSmallExample,
    ValidationGlobalOneRequiredExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ValidationExamplesModule {}

import { NgModule } from '@angular/core';
import { RadioContentExample } from './radio-content/radio-content-example';
import { RadioGroupExample } from './radio-group/radio-group-example';
import { RadioInvalidExample } from './radio-invalid/radio-invalid-example';
import { RadioOverviewExample } from './radio-overview/radio-overview-example';
import { RadioRequiredExample } from './radio-required/radio-required-example';
import { RadioSizeExample } from './radio-size/radio-size-example';
import { RadioStyleExample } from './radio-style/radio-style-example';

export {
    RadioContentExample,
    RadioGroupExample,
    RadioInvalidExample,
    RadioOverviewExample,
    RadioRequiredExample,
    RadioSizeExample,
    RadioStyleExample
};

const EXAMPLES = [
    RadioOverviewExample,
    RadioSizeExample,
    RadioStyleExample,
    RadioContentExample,
    RadioGroupExample,
    RadioInvalidExample,
    RadioRequiredExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class RadioExamplesModule {}

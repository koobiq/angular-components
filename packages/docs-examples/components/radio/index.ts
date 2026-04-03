import { NgModule } from '@angular/core';
import { RadioContentExample } from './radio-content/radio-content-example';
import { RadioGroupExample } from './radio-group/radio-group-example';
import { RadioMultilineExample } from './radio-multiline/radio-multiline-example';
import { RadioOverviewExample } from './radio-overview/radio-overview-example';
import { RadioStyleExample } from './radio-style/radio-style-example';

export { RadioContentExample, RadioGroupExample, RadioMultilineExample, RadioOverviewExample, RadioStyleExample };

const EXAMPLES = [
    RadioOverviewExample,
    RadioStyleExample,
    RadioContentExample,
    RadioGroupExample,
    RadioMultilineExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class RadioExamplesModule {}

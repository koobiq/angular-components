import { NgModule } from '@angular/core';
import { RadioContentExample } from './radio-content/radio-content-example';
import { RadioGroupExample } from './radio-group/radio-group-example';
import { RadioMultilineExample } from './radio-multiline/radio-multiline-example';
import { RadioSizeExample } from './radio-size/radio-size-example';
import { RadioStyleExample } from './radio-style/radio-style-example';

export { RadioContentExample, RadioGroupExample, RadioMultilineExample, RadioSizeExample, RadioStyleExample };

const EXAMPLES = [
    RadioSizeExample,
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

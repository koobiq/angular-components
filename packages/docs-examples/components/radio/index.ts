import { NgModule } from '@angular/core';
import { RadioContentExample } from './radio-content/radio-content-example';
import { RadioGroupExample } from './radio-group/radio-group-example';
import { RadioSizeExample } from './radio-size/radio-size-example';
import { RadioStyleExample } from './radio-style/radio-style-example';

export { RadioContentExample, RadioGroupExample, RadioSizeExample, RadioStyleExample };

const EXAMPLES = [
    RadioSizeExample,
    RadioStyleExample,
    RadioContentExample,
    RadioGroupExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class RadioExamplesModule {}

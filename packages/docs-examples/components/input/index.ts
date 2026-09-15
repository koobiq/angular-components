import { NgModule } from '@angular/core';
import { InputNumberOverviewExample } from './input-number-overview/input-number-overview-example';
import { InputOverviewExample } from './input-overview/input-overview-example';
import { InputPasswordOverviewExample } from './input-password-overview/input-password-overview-example';
import { InputWithMaskExample } from './input-with-mask/input-with-mask-example';

export { InputNumberOverviewExample, InputOverviewExample, InputPasswordOverviewExample, InputWithMaskExample };

const EXAMPLES = [
    InputOverviewExample,
    InputNumberOverviewExample,
    InputPasswordOverviewExample,
    InputWithMaskExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class InputExamplesModule {}

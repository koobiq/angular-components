import { NgModule } from '@angular/core';
import { InputChangePasswordExample } from './input-change-password/input-change-password-example';
import { InputNumberOverviewExample } from './input-number-overview/input-number-overview-example';
import { InputOverviewExample } from './input-overview/input-overview-example';
import { InputPasswordOverviewExample } from './input-password-overview/input-password-overview-example';

export { InputChangePasswordExample, InputNumberOverviewExample, InputOverviewExample, InputPasswordOverviewExample };

const EXAMPLES = [
    InputOverviewExample,
    InputNumberOverviewExample,
    InputPasswordOverviewExample,
    InputChangePasswordExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class InputExamplesModule {}

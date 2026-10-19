import { NgModule } from '@angular/core';
import { InputNumberOverviewExample } from './input-number-overview/input-number-overview-example';
import { InputOverviewExample } from './input-overview/input-overview-example';
import { InputPasswordOverviewExample } from './input-password-overview/input-password-overview-example';
import { InputPasswordTemplateDrivenExample } from './input-password-template-driven/input-password-template-driven-example';
import { InputWithMaskExample } from './input-with-mask/input-with-mask-example';

export {
    InputNumberOverviewExample,
    InputOverviewExample,
    InputPasswordOverviewExample,
    InputPasswordTemplateDrivenExample,
    InputWithMaskExample
};

const EXAMPLES = [
    InputOverviewExample,
    InputNumberOverviewExample,
    InputPasswordOverviewExample,
    InputPasswordTemplateDrivenExample,
    InputWithMaskExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class InputExamplesModule {}

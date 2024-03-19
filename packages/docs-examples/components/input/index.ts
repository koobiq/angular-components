import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

import { InputNumberOverviewExample } from './input-number-overview/input-number-overview-example';
import { InputOverviewExample } from './input-overview/input-overview-example';
import { InputPasswordOverviewExample } from './input-password-overview/input-password-overview-example';


export {
    InputOverviewExample,
    InputNumberOverviewExample,
    InputPasswordOverviewExample
};

const EXAMPLES = [
    InputOverviewExample,
    InputNumberOverviewExample,
    InputPasswordOverviewExample
];

@NgModule({
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqInputModule,
        KbqFormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class InputExamplesModule {}

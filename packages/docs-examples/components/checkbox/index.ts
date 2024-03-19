import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqPseudoCheckboxModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';

import { CheckboxIndeterminateExample } from './checkbox-indeterminate/checkbox-indeterminate-example';
import { CheckboxOverviewExample } from './checkbox-overview/checkbox-overview-example';
import { PseudoCheckboxExample } from './pseudo-checkbox/pseudo-checkbox-example';


export {
    CheckboxIndeterminateExample,
    CheckboxOverviewExample,
    PseudoCheckboxExample
};

const EXAMPLES = [
    CheckboxIndeterminateExample,
    CheckboxOverviewExample,
    PseudoCheckboxExample
];

@NgModule({
    imports: [
        CommonModule,
        KbqFormFieldModule,
        KbqCheckboxModule,
        KbqPseudoCheckboxModule,
        FormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class CheckboxExamplesModule {
}

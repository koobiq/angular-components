import { NgModule } from '@angular/core';
import { CheckboxIndeterminateExample } from './checkbox-indeterminate/checkbox-indeterminate-example';
import { CheckboxMultilineExample } from './checkbox-multiline/checkbox-multiline-example';
import { CheckboxOverviewExample } from './checkbox-overview/checkbox-overview-example';
import { PseudoCheckboxExample } from './pseudo-checkbox/pseudo-checkbox-example';

export { CheckboxIndeterminateExample, CheckboxMultilineExample, CheckboxOverviewExample, PseudoCheckboxExample };

const EXAMPLES = [
    CheckboxIndeterminateExample,
    CheckboxOverviewExample,
    PseudoCheckboxExample,
    CheckboxMultilineExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class CheckboxExamplesModule {}

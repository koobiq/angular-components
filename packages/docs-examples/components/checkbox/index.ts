import { NgModule } from '@angular/core';
import { CheckboxIndeterminateExample } from './checkbox-indeterminate/checkbox-indeterminate-example';
import { CheckboxOverviewExample } from './checkbox-overview/checkbox-overview-example';
import { PseudoCheckboxExample } from './pseudo-checkbox/pseudo-checkbox-example';

export { CheckboxIndeterminateExample, CheckboxOverviewExample, PseudoCheckboxExample };

const EXAMPLES = [
    CheckboxIndeterminateExample,
    CheckboxOverviewExample,
    PseudoCheckboxExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class CheckboxExamplesModule {}

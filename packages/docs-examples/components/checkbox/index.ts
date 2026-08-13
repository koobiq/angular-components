import { NgModule } from '@angular/core';
import { BlockCheckboxExample } from './block-checkbox/block-checkbox-example';
import { CheckboxIndeterminateExample } from './checkbox-indeterminate/checkbox-indeterminate-example';
import { CheckboxMultilineExample } from './checkbox-multiline/checkbox-multiline-example';
import { CheckboxOverviewExample } from './checkbox-overview/checkbox-overview-example';
import { PseudoCheckboxExample } from './pseudo-checkbox/pseudo-checkbox-example';

export {
    BlockCheckboxExample,
    CheckboxIndeterminateExample,
    CheckboxMultilineExample,
    CheckboxOverviewExample,
    PseudoCheckboxExample
};

const EXAMPLES = [
    CheckboxIndeterminateExample,
    CheckboxOverviewExample,
    PseudoCheckboxExample,
    CheckboxMultilineExample,
    BlockCheckboxExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class CheckboxExamplesModule {}

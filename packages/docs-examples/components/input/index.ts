import { NgModule } from '@angular/core';
import { InputAutocompleteExample } from './input-autocomplete/input-autocomplete-example';
import { InputDisabledExample } from './input-disabled/input-disabled-example';
import { InputLabelAndHintExample } from './input-label-and-hint/input-label-and-hint-example';
import { InputMonospaceExample } from './input-monospace/input-monospace-example';
import { InputNumberOverviewExample } from './input-number-overview/input-number-overview-example';
import { InputOverviewExample } from './input-overview/input-overview-example';
import { InputPasswordOverviewExample } from './input-password-overview/input-password-overview-example';
import { InputPasswordTemplateDrivenExample } from './input-password-template-driven/input-password-template-driven-example';
import { InputReadonlyExample } from './input-readonly/input-readonly-example';
import { InputSearchExample } from './input-search/input-search-example';
import { InputValidationExample } from './input-validation/input-validation-example';
import { InputWithCleanerExample } from './input-with-cleaner/input-with-cleaner-example';
import { InputWithMaskExample } from './input-with-mask/input-with-mask-example';
import { InputWithoutBordersExample } from './input-without-borders/input-without-borders-example';

export {
    InputAutocompleteExample,
    InputDisabledExample,
    InputLabelAndHintExample,
    InputMonospaceExample,
    InputNumberOverviewExample,
    InputOverviewExample,
    InputPasswordOverviewExample,
    InputPasswordTemplateDrivenExample,
    InputReadonlyExample,
    InputSearchExample,
    InputValidationExample,
    InputWithCleanerExample,
    InputWithMaskExample,
    InputWithoutBordersExample
};

const EXAMPLES = [
    InputOverviewExample,
    InputValidationExample,
    InputDisabledExample,
    InputReadonlyExample,
    InputWithCleanerExample,
    InputSearchExample,
    InputWithoutBordersExample,
    InputNumberOverviewExample,
    InputPasswordOverviewExample,
    InputWithMaskExample,
    InputAutocompleteExample,
    InputLabelAndHintExample,
    InputPasswordTemplateDrivenExample,
    InputMonospaceExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class InputExamplesModule {}

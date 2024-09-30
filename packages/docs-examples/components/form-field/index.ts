import { NgModule } from '@angular/core';
import { FormFieldPasswordOverviewExample } from './form-field-password-overview/form-field-password-overview-example';
import { FormFieldWithCleanerExample } from './form-field-with-cleaner/form-field-with-cleaner-example';
import { FormFieldWithCustomErrorStateMatcher } from './form-field-with-custom-error-state-matcher/form-field-with-custom-error-state-matcher-example';
import { FormFieldWithErrorExample } from './form-field-with-error/form-field-with-error-example';
import { FormFieldWithHintExample } from './form-field-with-hint/form-field-with-hint-example';
import { FormFieldWithLabelExample } from './form-field-with-label/form-field-with-label-example';
import { FormFieldWithPrefixAndSuffixExample } from './form-field-with-prefix-and-suffix/form-field-with-prefix-and-suffix-example';
import { FormFieldWithoutBordersExample } from './form-field-without-borders/form-field-without-borders-example';

export {
    FormFieldPasswordOverviewExample,
    FormFieldWithCleanerExample,
    FormFieldWithCustomErrorStateMatcher,
    FormFieldWithErrorExample,
    FormFieldWithHintExample,
    FormFieldWithLabelExample,
    FormFieldWithoutBordersExample,
    FormFieldWithPrefixAndSuffixExample
};

const EXAMPLES = [
    FormFieldWithCleanerExample,
    FormFieldWithCustomErrorStateMatcher,
    FormFieldWithErrorExample,
    FormFieldWithHintExample,
    FormFieldWithLabelExample,
    FormFieldWithPrefixAndSuffixExample,
    FormFieldWithoutBordersExample,
    FormFieldPasswordOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class FormFieldExamplesModule {}

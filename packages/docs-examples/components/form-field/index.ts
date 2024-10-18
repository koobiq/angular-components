import { NgModule } from '@angular/core';
import { FormFieldPasswordOverviewExample } from './form-field-password-overview/form-field-password-overview-example';
import { FormFieldWithCleanerExample } from './form-field-with-cleaner/form-field-with-cleaner-example';
import { FormFieldWithCustomErrorStateMatcherSetByAttributeExample } from './form-field-with-custom-error-state-matcher-set-by-attribute/form-field-with-custom-error-state-matcher-set-by-attribute-example';
import { FormFieldWithCustomErrorStateMatcherSetByDependencyInjectionProviderExample } from './form-field-with-custom-error-state-matcher-set-by-dependency-injection-provider/form-field-with-custom-error-state-matcher-set-by-dependency-injection-provider-example';
import { FormFieldWithErrorExample } from './form-field-with-error/form-field-with-error-example';
import { FormFieldWithHintExample } from './form-field-with-hint/form-field-with-hint-example';
import { FormFieldWithLabelExample } from './form-field-with-label/form-field-with-label-example';
import { FormFieldWithPrefixAndSuffixExample } from './form-field-with-prefix-and-suffix/form-field-with-prefix-and-suffix-example';
import { FormFieldWithoutBordersExample } from './form-field-without-borders/form-field-without-borders-example';

export {
    FormFieldPasswordOverviewExample,
    FormFieldWithCleanerExample,
    FormFieldWithCustomErrorStateMatcherSetByAttributeExample,
    FormFieldWithCustomErrorStateMatcherSetByDependencyInjectionProviderExample,
    FormFieldWithErrorExample,
    FormFieldWithHintExample,
    FormFieldWithLabelExample,
    FormFieldWithoutBordersExample,
    FormFieldWithPrefixAndSuffixExample
};

const EXAMPLES = [
    FormFieldPasswordOverviewExample,
    FormFieldWithCleanerExample,
    FormFieldWithCustomErrorStateMatcherSetByAttributeExample,
    FormFieldWithCustomErrorStateMatcherSetByDependencyInjectionProviderExample,
    FormFieldWithErrorExample,
    FormFieldWithHintExample,
    FormFieldWithLabelExample,
    FormFieldWithoutBordersExample,
    FormFieldWithPrefixAndSuffixExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class FormFieldExamplesModule {}

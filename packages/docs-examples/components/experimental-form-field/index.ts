import { NgModule } from '@angular/core';
import { ExperimentalFormFieldPasswordOverviewExample } from './experimental-form-field-password-overview/experimental-form-field-password-overview-example';
import { ExperimentalFormFieldWithCleanerExample } from './experimental-form-field-with-cleaner/experimental-form-field-with-cleaner-example';
import { ExperimentalFormFieldWithCustomErrorStateMatcherSetByAttributeExample } from './experimental-form-field-with-custom-error-state-matcher-set-by-attribute/experimental-form-field-with-custom-error-state-matcher-set-by-attribute-example';
import { ExperimentalFormFieldWithErrorExample } from './experimental-form-field-with-error/experimental-form-field-with-error-example';
import { ExperimentalFormFieldWithHintExample } from './experimental-form-field-with-hint/experimental-form-field-with-hint-example';
import { ExperimentalFormFieldWithLabelExample } from './experimental-form-field-with-label/experimental-form-field-with-label-example';
import { ExperimentalFormFieldWithPrefixAndSuffixExample } from './experimental-form-field-with-prefix-and-suffix/experimental-form-field-with-prefix-and-suffix-example';
import { ExperimentalFormFieldWithoutBordersExample } from './experimental-form-field-without-borders/experimental-form-field-without-borders-example';
import { ExperimentalFormFieldWithCustomErrorStateMatcherSetByDependencyInjectionProviderExample } from './experimental-form-field-with-custom-error-state-matcher-set-by-dependency-injection-provider/experimental-form-field-with-error-state-matcher-set-by-di-example';

export {
    ExperimentalFormFieldPasswordOverviewExample,
    ExperimentalFormFieldWithCleanerExample,
    ExperimentalFormFieldWithCustomErrorStateMatcherSetByAttributeExample,
    ExperimentalFormFieldWithCustomErrorStateMatcherSetByDependencyInjectionProviderExample,
    ExperimentalFormFieldWithErrorExample,
    ExperimentalFormFieldWithHintExample,
    ExperimentalFormFieldWithLabelExample,
    ExperimentalFormFieldWithoutBordersExample,
    ExperimentalFormFieldWithPrefixAndSuffixExample
};

const EXAMPLES = [
    ExperimentalFormFieldPasswordOverviewExample,
    ExperimentalFormFieldWithCleanerExample,
    ExperimentalFormFieldWithCustomErrorStateMatcherSetByAttributeExample,
    ExperimentalFormFieldWithCustomErrorStateMatcherSetByDependencyInjectionProviderExample,
    ExperimentalFormFieldWithErrorExample,
    ExperimentalFormFieldWithHintExample,
    ExperimentalFormFieldWithLabelExample,
    ExperimentalFormFieldWithoutBordersExample,
    ExperimentalFormFieldWithPrefixAndSuffixExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ExperimentalFormFieldExamplesModule {}

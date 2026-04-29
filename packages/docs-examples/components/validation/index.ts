import { NgModule } from '@angular/core';
import { ValidationBasicMultipleValidatorsExample } from './validation-basic-multiple-validators/validation-basic-multiple-validators-example';
import { ValidationBasicSingleValidatorExample } from './validation-basic-single-validator/validation-basic-single-validator-example';
import { ValidationMessageForSpecificFieldExample } from './validation-message-for-specific-field/validation-message-for-specific-field-example';
import { ValidationMessageGlobalWithLinksExample } from './validation-message-global-with-links/validation-message-global-with-links-example';
import { ValidationMessageGlobalExample } from './validation-message-global/validation-message-global-example';
import { ValidationNoMessageExample } from './validation-no-message/validation-no-message-example';
import { ValidationOnBlurFilledExample } from './validation-on-blur-filled/validation-on-blur-filled-example';
import { ValidationOnBlurExample } from './validation-on-blur/validation-on-blur-example';
import { ValidationOnOpenExample } from './validation-on-open/validation-on-open-example';
import { ValidationOnSubmitCustomMatcherExample } from './validation-on-submit-custom-matcher/validation-on-submit-custom-matcher-example';
import { ValidationOnSubmitExample } from './validation-on-submit/validation-on-submit-example';
import { ValidationOnTypeExample } from './validation-on-type/validation-on-type-example';
import { ValidationOptionalLabelExample } from './validation-optional-label/validation-optional-label-example';
import { ValidationRequiredLabelExample } from './validation-required-label/validation-required-label-example';
import { ValidationTagListExample } from './validation-tag-list/validation-tag-list-example';

export {
    ValidationBasicMultipleValidatorsExample,
    ValidationBasicSingleValidatorExample,
    ValidationMessageForSpecificFieldExample,
    ValidationMessageGlobalExample,
    ValidationMessageGlobalWithLinksExample,
    ValidationNoMessageExample,
    ValidationOnBlurExample,
    ValidationOnBlurFilledExample,
    ValidationOnOpenExample,
    ValidationOnSubmitCustomMatcherExample,
    ValidationOnSubmitExample,
    ValidationOnTypeExample,
    ValidationOptionalLabelExample,
    ValidationRequiredLabelExample,
    ValidationTagListExample
};

const EXAMPLES = [
    ValidationBasicSingleValidatorExample,
    ValidationBasicMultipleValidatorsExample,
    ValidationOnSubmitExample,
    ValidationOnBlurExample,
    ValidationOnBlurFilledExample,
    ValidationOnTypeExample,
    ValidationMessageGlobalWithLinksExample,
    ValidationOnOpenExample,
    ValidationOptionalLabelExample,
    ValidationRequiredLabelExample,
    ValidationMessageForSpecificFieldExample,
    ValidationMessageGlobalExample,
    ValidationNoMessageExample,
    ValidationTagListExample,
    ValidationOnSubmitCustomMatcherExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ValidationExamplesModule {}

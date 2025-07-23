import { NgModule } from '@angular/core';
import { ValidationGlobalOneRequiredExample } from './validation-global-one-required/validation-global-one-required-example';
import { ValidationMessageForSpecificFieldExample } from './validation-message-for-specific-field/validation-message-for-specific-field-example';
import { ValidationNoMessageExample } from './validation-no-message/validation-no-message-example';
import { ValidationOnBlurExample } from './validation-on-blur/validation-on-blur-example';
import { ValidationOnOpenExample } from './validation-on-open/validation-on-open-example';
import { ValidationOnSubmitExample } from './validation-on-submit/validation-on-submit-example';
import { ValidationOnTypeExample } from './validation-on-type/validation-on-type-example';
import { ValidationOptionalLabelExample } from './validation-optional-label/validation-optional-label-example';
import { ValidationRequiredLabelExample } from './validation-required-label/validation-required-label-example';

export {
    ValidationGlobalOneRequiredExample,
    ValidationMessageForSpecificFieldExample,
    ValidationNoMessageExample,
    ValidationOnBlurExample,
    ValidationOnOpenExample,
    ValidationOnSubmitExample,
    ValidationOnTypeExample,
    ValidationOptionalLabelExample,
    ValidationRequiredLabelExample
};

const EXAMPLES = [
    ValidationOnSubmitExample,
    ValidationOnBlurExample,
    ValidationOnTypeExample,
    ValidationGlobalOneRequiredExample,
    ValidationOnOpenExample,
    ValidationOptionalLabelExample,
    ValidationRequiredLabelExample,
    ValidationMessageForSpecificFieldExample,
    ValidationNoMessageExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ValidationExamplesModule {}

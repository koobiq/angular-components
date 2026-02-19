import { NgModule } from '@angular/core';
import { ValidationMessageForSpecificFieldExample } from './validation-message-for-specific-field/validation-message-for-specific-field-example';
import { ValidationMessageGlobalWithLinksExample } from './validation-message-global-with-links/validation-message-global-with-links-example';
import { ValidationMessageGlobalExample } from './validation-message-global/validation-message-global-example';
import { ValidationNoMessageExample } from './validation-no-message/validation-no-message-example';
import { ValidationOnBlurFilledExample } from './validation-on-blur-filled/validation-on-blur-filled-example';
import { ValidationOnBlurExample } from './validation-on-blur/validation-on-blur-example';
import { ValidationOnOpenExample } from './validation-on-open/validation-on-open-example';
import { ValidationOnSubmitExample } from './validation-on-submit/validation-on-submit-example';
import { ValidationOnTypeExample } from './validation-on-type/validation-on-type-example';
import { ValidationOptionalLabelExample } from './validation-optional-label/validation-optional-label-example';
import { ValidationRequiredLabelExample } from './validation-required-label/validation-required-label-example';
import { ValidationTagListExample } from './validation-tag-list/validation-tag-list-example';

export {
    ValidationMessageForSpecificFieldExample,
    ValidationMessageGlobalExample,
    ValidationMessageGlobalWithLinksExample,
    ValidationNoMessageExample,
    ValidationOnBlurExample,
    ValidationOnBlurFilledExample,
    ValidationOnOpenExample,
    ValidationOnSubmitExample,
    ValidationOnTypeExample,
    ValidationOptionalLabelExample,
    ValidationRequiredLabelExample,
    ValidationTagListExample
};

const EXAMPLES = [
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
    ValidationTagListExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ValidationExamplesModule {}

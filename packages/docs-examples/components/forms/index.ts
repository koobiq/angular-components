import { NgModule } from '@angular/core';
import { FormFieldsetInvalidExample } from './form-fieldset-invalid/form-fieldset-invalid-example';
import { FormFieldsetOverviewExample } from './form-fieldset-overview/form-fieldset-overview-example';
import { FormFieldsetWithButtonExample } from './form-fieldset-with-button/form-fieldset-with-button-example';
import { HorizontalFormLabelsExample } from './horizontal-form-labels/horizontal-form-labels-example';
import { HorizontalFormExample } from './horizontal-form/horizontal-form-example';
import { VerticalFormExample } from './vertical-form/vertical-form-example';

export {
    FormFieldsetInvalidExample,
    FormFieldsetOverviewExample,
    FormFieldsetWithButtonExample,
    HorizontalFormExample,
    HorizontalFormLabelsExample,
    VerticalFormExample
};

const EXAMPLES = [
    HorizontalFormExample,
    HorizontalFormLabelsExample,
    VerticalFormExample,
    FormFieldsetOverviewExample,
    FormFieldsetInvalidExample,
    FormFieldsetWithButtonExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class FormsExamplesModule {}

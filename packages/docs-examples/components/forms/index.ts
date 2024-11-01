import { NgModule } from '@angular/core';
import { HorizontalFormLabelsExample } from './horizontal-form-labels/horizontal-form-labels-example';
import { HorizontalFormExample } from './horizontal-form/horizontal-form-example';
import { VerticalFormExample } from './vertical-form/vertical-form-example';

export { HorizontalFormExample, HorizontalFormLabelsExample, VerticalFormExample };

const EXAMPLES = [
    HorizontalFormExample,
    HorizontalFormLabelsExample,
    VerticalFormExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class FormsExamplesModule {}

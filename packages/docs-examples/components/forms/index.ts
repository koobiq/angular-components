import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { HorizontalFormLabelsExample } from './horizontal-form-labels/horizontal-form-labels-example';
import { HorizontalFormExample } from './horizontal-form/horizontal-form-example';
import { VerticalFormExample } from './vertical-form/vertical-form-example';

export { HorizontalFormExample, HorizontalFormLabelsExample, VerticalFormExample };

const EXAMPLES = [
    HorizontalFormExample,
    HorizontalFormLabelsExample,
    VerticalFormExample,
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        KbqInputModule,
        KbqFormFieldModule,
        KbqFormsModule,
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES,
})
export class FormsExamplesModule {}

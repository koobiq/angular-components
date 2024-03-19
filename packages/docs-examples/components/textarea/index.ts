import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextareaModule } from '@koobiq/components/textarea';

import { TextAreaOverviewExample } from './text-area-overview/text-area-overview-example';


export {
    TextAreaOverviewExample
};

const EXAMPLES = [
    TextAreaOverviewExample
];

@NgModule({
    imports: [
        FormsModule,
        KbqTextareaModule,
        KbqFormFieldModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TextAreaExamplesModule {
}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqRadioModule } from '@koobiq/components/radio';

import { RadioOverviewExample } from './radio-overview/radio-overview-example';


export {
    RadioOverviewExample
};

const EXAMPLES = [
    RadioOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        KbqFormFieldModule,
        KbqCheckboxModule,
        KbqRadioModule,
        FormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class RadioExamplesModule {
}

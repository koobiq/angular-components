import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

import { ProgressSpinnerIndeterminateExample } from './progress-spinner-indeterminate/progress-spinner-indeterminate-example';
import { ProgressSpinnerOverviewExample } from './progress-spinner-overview/progress-spinner-overview-example';


export {
    ProgressSpinnerIndeterminateExample,
    ProgressSpinnerOverviewExample
};

const EXAMPLES = [
    ProgressSpinnerIndeterminateExample,
    ProgressSpinnerOverviewExample
];
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        KbqFormFieldModule,
        KbqProgressSpinnerModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class  ProgressSpinnerExamplesModule {}

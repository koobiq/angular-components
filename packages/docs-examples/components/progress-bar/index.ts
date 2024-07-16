import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';
import { ProgressBarIndeterminateExample } from './progress-bar-indeterminate/progress-bar-indeterminate-example';
import { ProgressBarOverviewExample } from './progress-bar-overview/progress-bar-overview-example';

export { ProgressBarIndeterminateExample, ProgressBarOverviewExample };

const EXAMPLES = [
    ProgressBarIndeterminateExample,
    ProgressBarOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqProgressBarModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class ProgressBarExamplesModule {}

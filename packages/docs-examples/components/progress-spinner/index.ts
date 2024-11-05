import { NgModule } from '@angular/core';
import { ProgressSpinnerIndeterminateExample } from './progress-spinner-indeterminate/progress-spinner-indeterminate-example';
import { ProgressSpinnerOverviewExample } from './progress-spinner-overview/progress-spinner-overview-example';

export { ProgressSpinnerIndeterminateExample, ProgressSpinnerOverviewExample };

const EXAMPLES = [
    ProgressSpinnerIndeterminateExample,
    ProgressSpinnerOverviewExample
];
@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ProgressSpinnerExamplesModule {}

import { NgModule } from '@angular/core';
import { ProgressBarIndeterminateExample } from './progress-bar-indeterminate/progress-bar-indeterminate-example';
import { ProgressBarOverviewExample } from './progress-bar-overview/progress-bar-overview-example';

export { ProgressBarIndeterminateExample, ProgressBarOverviewExample };

const EXAMPLES = [
    ProgressBarIndeterminateExample,
    ProgressBarOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ProgressBarExamplesModule {}

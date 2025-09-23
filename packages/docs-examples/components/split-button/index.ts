import { NgModule } from '@angular/core';
import { SplitButtonOverviewExample } from './split-button-overview/split-button-overview-example';

export { SplitButtonOverviewExample };

const EXAMPLES = [
    SplitButtonOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SplitButtonExamplesModule {}

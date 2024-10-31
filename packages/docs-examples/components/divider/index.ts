import { NgModule } from '@angular/core';
import { DividerOverviewExample } from './divider-overview/divider-overview-example';
import { DividerVerticalExample } from './divider-vertical/divider-vertical-example';

export { DividerOverviewExample, DividerVerticalExample };

const EXAMPLES = [
    DividerOverviewExample,
    DividerVerticalExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class DividerExamplesModule {}

import { NgModule } from '@angular/core';
import { OverflowItemsOverviewExample } from './overflow-items-overview/overflow-items-overview-example';
import { OverflowItemsResultOffsetExample } from './overflow-items-result-offset/overflow-items-result-offset-example';

export { OverflowItemsOverviewExample, OverflowItemsResultOffsetExample };

const EXAMPLES = [
    OverflowItemsOverviewExample,
    OverflowItemsResultOffsetExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class OverflowItemsExamplesModule {}

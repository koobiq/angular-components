import { NgModule } from '@angular/core';
import { OverflowItemsJustifyContentExample } from './overflow-items-justify-content/overflow-items-justify-content-example';
import { OverflowItemsOverviewExample } from './overflow-items-overview/overflow-items-overview-example';
import { OverflowItemsWithOrderExample } from './overflow-items-with-order/overflow-items-with-order-example';

export { OverflowItemsJustifyContentExample, OverflowItemsOverviewExample, OverflowItemsWithOrderExample };

const EXAMPLES = [
    OverflowItemsOverviewExample,
    OverflowItemsWithOrderExample,
    OverflowItemsJustifyContentExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class OverflowItemsExamplesModule {}

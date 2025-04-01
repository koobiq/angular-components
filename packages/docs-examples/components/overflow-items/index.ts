import { NgModule } from '@angular/core';
import { OverflowItemsOverviewExample } from './overflow-items-overview/overflow-items-overview-example';
import { OverflowItemsWithOrderExample } from './overflow-items-with-order/overflow-items-with-order-example';

export { OverflowItemsOverviewExample, OverflowItemsWithOrderExample };

const EXAMPLES = [
    OverflowItemsOverviewExample,
    OverflowItemsWithOrderExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class OverflowItemsExamplesModule {}

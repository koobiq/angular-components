import { NgModule } from '@angular/core';
import { OverflowItemsOverflowOrderExample } from './overflow-items-overflow-order/overflow-items-overflow-order-example';
import { OverflowItemsOverviewExample } from './overflow-items-overview/overflow-items-overview-example';

export { OverflowItemsOverflowOrderExample, OverflowItemsOverviewExample };

const EXAMPLES = [
    OverflowItemsOverviewExample,
    OverflowItemsOverflowOrderExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class OverflowItemsExamplesModule {}

import { NgModule } from '@angular/core';
import { OverflowItemsJustifyContentExample } from './overflow-items-justify-content/overflow-items-justify-content-example';
import { OverflowItemsOverviewExample } from './overflow-items-overview/overflow-items-overview-example';
import { OverflowItemsWithAlwaysVisibleItemExample } from './overflow-items-with-always-visible-item/overflow-items-with-always-visible-item-example';
import { OverflowItemsWithOrderExample } from './overflow-items-with-order/overflow-items-with-order-example';
import { OverflowItemsWithVerticalOrientationExample } from './overflow-items-with-vertical-orientation/overflow-items-with-vertical-orientation-example';

export {
    OverflowItemsJustifyContentExample,
    OverflowItemsOverviewExample,
    OverflowItemsWithAlwaysVisibleItemExample,
    OverflowItemsWithOrderExample,
    OverflowItemsWithVerticalOrientationExample
};

const EXAMPLES = [
    OverflowItemsOverviewExample,
    OverflowItemsWithOrderExample,
    OverflowItemsJustifyContentExample,
    OverflowItemsWithAlwaysVisibleItemExample,
    OverflowItemsWithVerticalOrientationExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class OverflowItemsExamplesModule {}

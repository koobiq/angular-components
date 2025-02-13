import { NgModule } from '@angular/core';
import { OverflowItemsOverviewExample } from './overflow-items-overview/overflow-items-overview-example';

export { OverflowItemsOverviewExample };

const EXAMPLES = [
    OverflowItemsOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class OverflowItemsExamplesModule {}

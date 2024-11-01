import { NgModule } from '@angular/core';
import { DlHorizontalOverviewExample } from './dl-horizontal-overview/dl-horizontal-overview-example';
import { DlOverviewExample } from './dl-overview/dl-overview-example';
import { DlSmallExample } from './dl-small/dl-small-example';
import { DlVerticalOverviewExample } from './dl-vertical-overview/dl-vertical-overview-example';

export { DlHorizontalOverviewExample, DlOverviewExample, DlSmallExample, DlVerticalOverviewExample };

const EXAMPLES = [
    DlOverviewExample,
    DlHorizontalOverviewExample,
    DlVerticalOverviewExample,
    DlSmallExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class DlExamplesModule {}

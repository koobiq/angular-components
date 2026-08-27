import { NgModule } from '@angular/core';
import { DlHorizontalOverviewExample } from './dl-horizontal-overview/dl-horizontal-overview-example';
import { DlLongTextExample } from './dl-long-text/dl-long-text-example';
import { DlOverviewExample } from './dl-overview/dl-overview-example';
import { DlResizableExample } from './dl-resizable/dl-resizable-example';
import { DlSmallExample } from './dl-small/dl-small-example';
import { DlVerticalOverviewExample } from './dl-vertical-overview/dl-vertical-overview-example';

export {
    DlHorizontalOverviewExample,
    DlLongTextExample,
    DlOverviewExample,
    DlResizableExample,
    DlSmallExample,
    DlVerticalOverviewExample
};

const EXAMPLES = [
    DlOverviewExample,
    DlHorizontalOverviewExample,
    DlVerticalOverviewExample,
    DlSmallExample,
    DlResizableExample,
    DlLongTextExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class DlExamplesModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqLinkModule } from '@koobiq/components/link';

import { DlHorizontalOverviewExample } from './dl-horizontal-overview/dl-horizontal-overview-example';
import { DlOverviewExample } from './dl-overview/dl-overview-example';
import { DlSmallExample } from './dl-small/dl-small-example';
import { DlVerticalOverviewExample } from './dl-vertical-overview/dl-vertical-overview-example';


export {
    DlOverviewExample,
    DlHorizontalOverviewExample,
    DlVerticalOverviewExample,
    DlSmallExample
};

const EXAMPLES = [
    DlOverviewExample,
    DlHorizontalOverviewExample,
    DlVerticalOverviewExample,
    DlSmallExample
];

@NgModule({
    imports: [
        CommonModule,
        KbqDlModule,
        KbqLinkModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class DlExamplesModule {}

import { NgModule } from '@angular/core';
import { DlAlignmentExample } from './dl-alignment/dl-alignment-example';
import { DlDtWidthExample } from './dl-dt-width/dl-dt-width-example';
import { DlLongTextExample } from './dl-long-text/dl-long-text-example';
import { DlMinWidthExample } from './dl-min-width/dl-min-width-example';
import { DlOverviewExample } from './dl-overview/dl-overview-example';
import { DlResizableExample } from './dl-resizable/dl-resizable-example';
import { DlVerticalBreakpointExample } from './dl-vertical-breakpoint/dl-vertical-breakpoint-example';
import { DlVerticalExample } from './dl-vertical/dl-vertical-example';
import { DlWideExample } from './dl-wide/dl-wide-example';
import { DlWidthSyncExample } from './dl-width-sync/dl-width-sync-example';

export {
    DlAlignmentExample,
    DlDtWidthExample,
    DlLongTextExample,
    DlMinWidthExample,
    DlOverviewExample,
    DlResizableExample,
    DlVerticalBreakpointExample,
    DlVerticalExample,
    DlWideExample,
    DlWidthSyncExample
};

const EXAMPLES = [
    DlOverviewExample,
    DlWideExample,
    DlVerticalExample,
    DlVerticalBreakpointExample,
    DlAlignmentExample,
    DlDtWidthExample,
    DlResizableExample,
    DlMinWidthExample,
    DlWidthSyncExample,
    DlLongTextExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class DlExamplesModule {}

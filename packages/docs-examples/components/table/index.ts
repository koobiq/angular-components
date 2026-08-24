import { NgModule } from '@angular/core';
import { TableDisableHoverExample } from './table-disable-hover/table-disable-hover-example';
import { TableFullWidthExample } from './table-full-width/table-full-width-example';
import { TableOverviewExample } from './table-overview/table-overview-example';
import { TableStickyHeaderExample } from './table-sticky-header/table-sticky-header-example';
import { TableWithBordersExample } from './table-with-borders/table-with-borders-example';

export {
    TableDisableHoverExample,
    TableFullWidthExample,
    TableOverviewExample,
    TableStickyHeaderExample,
    TableWithBordersExample
};

const EXAMPLES = [
    TableOverviewExample,
    TableWithBordersExample,
    TableFullWidthExample,
    TableDisableHoverExample,
    TableStickyHeaderExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TableExamplesModule {}

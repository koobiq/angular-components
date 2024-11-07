import { NgModule } from '@angular/core';
import { TableFullWidthExample } from './table-full-width/table-full-width-example';
import { TableOverviewExample } from './table-overview/table-overview-example';
import { TableWithBordersExample } from './table-with-borders/table-with-borders-example';

export { TableFullWidthExample, TableOverviewExample, TableWithBordersExample };

const EXAMPLES = [
    TableOverviewExample,
    TableWithBordersExample,
    TableFullWidthExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TableExamplesModule {}

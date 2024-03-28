import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqTableModule } from '@koobiq/components/table';

import { TableOverviewExample } from './table-overview/table-overview-example';
import { TableWithBordersExample } from './table-with-borders/table-with-borders-example';


export {
    TableOverviewExample,
    TableWithBordersExample
};

const EXAMPLES = [
    TableOverviewExample,
    TableWithBordersExample
];

@NgModule({
    imports: [CommonModule, KbqTableModule],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TableExamplesModule {}

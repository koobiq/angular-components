import { NgModule } from '@angular/core';
import { AgGridOverviewExample } from './ag-grid-overview/ag-grid-overview-example';
import { AgGridRowDraggingExample } from './ag-grid-row-dragging/ag-grid-row-dragging-example';

export { AgGridOverviewExample, AgGridRowDraggingExample };

const EXAMPLES = [
    AgGridOverviewExample,
    AgGridRowDraggingExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class AgGridExamplesModule {}

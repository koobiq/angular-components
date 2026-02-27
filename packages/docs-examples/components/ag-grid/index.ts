import { NgModule } from '@angular/core';
import { AgGridCopySelectedExample } from './ag-grid-copy-selected/ag-grid-copy-selected-example';
import { AgGridOverviewExample } from './ag-grid-overview/ag-grid-overview-example';
import { AgGridRowActionsExample } from './ag-grid-row-actions/ag-grid-row-actions-example';
import { AgGridRowDraggingExample } from './ag-grid-row-dragging/ag-grid-row-dragging-example';
import { AgGridStatusBarExample } from './ag-grid-status-bar/ag-grid-status-bar-example';

export {
    AgGridCopySelectedExample,
    AgGridOverviewExample,
    AgGridRowActionsExample,
    AgGridRowDraggingExample,
    AgGridStatusBarExample
};

const EXAMPLES = [
    AgGridOverviewExample,
    AgGridRowDraggingExample,
    AgGridCopySelectedExample,
    AgGridStatusBarExample,
    AgGridRowActionsExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class AgGridExamplesModule {}

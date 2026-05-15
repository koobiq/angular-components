import { NgModule } from '@angular/core';
import { AgGridColumnStateExample } from './ag-grid-column-state/ag-grid-column-state-example';
import { AgGridCopySelectedExample } from './ag-grid-copy-selected/ag-grid-copy-selected-example';
import { AgGridExternalFilterStateExample } from './ag-grid-external-filter-state/ag-grid-external-filter-state-example';
import { AgGridFilterStateExample } from './ag-grid-filter-state/ag-grid-filter-state-example';
import { AgGridOverviewExample } from './ag-grid-overview/ag-grid-overview-example';
import { AgGridQuickFilterStateExample } from './ag-grid-quick-filter-state/ag-grid-quick-filter-state-example';
import { AgGridRowActionsExample } from './ag-grid-row-actions/ag-grid-row-actions-example';
import { AgGridRowDraggingExample } from './ag-grid-row-dragging/ag-grid-row-dragging-example';
import { AgGridStatusBarExample } from './ag-grid-status-bar/ag-grid-status-bar-example';

export {
    AgGridColumnStateExample,
    AgGridCopySelectedExample,
    AgGridExternalFilterStateExample,
    AgGridFilterStateExample,
    AgGridOverviewExample,
    AgGridQuickFilterStateExample,
    AgGridRowActionsExample,
    AgGridRowDraggingExample,
    AgGridStatusBarExample
};

const EXAMPLES = [
    AgGridOverviewExample,
    AgGridRowDraggingExample,
    AgGridCopySelectedExample,
    AgGridStatusBarExample,
    AgGridRowActionsExample,
    AgGridColumnStateExample,
    AgGridFilterStateExample,
    AgGridQuickFilterStateExample,
    AgGridExternalFilterStateExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class AgGridExamplesModule {}

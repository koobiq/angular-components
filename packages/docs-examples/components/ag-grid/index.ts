import { NgModule } from '@angular/core';
import { AgGridColumnMenuExample } from './ag-grid-column-menu/ag-grid-column-menu-example';
import { AgGridColumnStateExample } from './ag-grid-column-state/ag-grid-column-state-example';
import { AgGridCopySelectedExample } from './ag-grid-copy-selected/ag-grid-copy-selected-example';
import { AgGridExternalFilterStateExample } from './ag-grid-external-filter-state/ag-grid-external-filter-state-example';
import { AgGridFilterStateExample } from './ag-grid-filter-state/ag-grid-filter-state-example';
import { AgGridInfiniteSelectionExample } from './ag-grid-infinite-selection/ag-grid-infinite-selection-example';
import { AgGridLoadingOverlayExample } from './ag-grid-loading-overlay/ag-grid-loading-overlay-example';
import { AgGridOverviewExample } from './ag-grid-overview/ag-grid-overview-example';
import { AgGridQuickFilterStateExample } from './ag-grid-quick-filter-state/ag-grid-quick-filter-state-example';
import { AgGridRowActionsExample } from './ag-grid-row-actions/ag-grid-row-actions-example';
import { AgGridRowDraggingExample } from './ag-grid-row-dragging/ag-grid-row-dragging-example';
import { AgGridSkeletonCellRendererExample } from './ag-grid-skeleton-cell-renderer/ag-grid-skeleton-cell-renderer-example';
import { AgGridStatusBarExample } from './ag-grid-status-bar/ag-grid-status-bar-example';

export {
    AgGridColumnMenuExample,
    AgGridColumnStateExample,
    AgGridCopySelectedExample,
    AgGridExternalFilterStateExample,
    AgGridFilterStateExample,
    AgGridInfiniteSelectionExample,
    AgGridLoadingOverlayExample,
    AgGridOverviewExample,
    AgGridQuickFilterStateExample,
    AgGridRowActionsExample,
    AgGridRowDraggingExample,
    AgGridSkeletonCellRendererExample,
    AgGridStatusBarExample
};

const EXAMPLES = [
    AgGridColumnMenuExample,
    AgGridOverviewExample,
    AgGridRowDraggingExample,
    AgGridCopySelectedExample,
    AgGridStatusBarExample,
    AgGridRowActionsExample,
    AgGridColumnStateExample,
    AgGridFilterStateExample,
    AgGridQuickFilterStateExample,
    AgGridExternalFilterStateExample,
    AgGridLoadingOverlayExample,
    AgGridSkeletonCellRendererExample,
    AgGridInfiniteSelectionExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class AgGridExamplesModule {}

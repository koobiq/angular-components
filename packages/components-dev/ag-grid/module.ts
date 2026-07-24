import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    AgGridColumnMenuExample,
    AgGridColumnStateExample,
    AgGridCopySelectedExample,
    AgGridExportExample,
    AgGridExternalFilterStateExample,
    AgGridFilterStateExample,
    AgGridInfiniteSelectionExample,
    AgGridLoadingOverlayExample,
    AgGridOverviewExample,
    AgGridQuickFilterStateExample,
    AgGridRowActionsExample,
    AgGridRowDraggingExample,
    AgGridRowFocusStateExample,
    AgGridRowGroupExample,
    AgGridRowSelectionStateExample,
    AgGridSkeletonCellRendererExample,
    AgGridStatusBarExample
} from 'packages/docs-examples/components/ag-grid';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        AgGridColumnMenuExample,
        AgGridOverviewExample,
        AgGridRowDraggingExample,
        AgGridRowGroupExample,
        AgGridCopySelectedExample,
        AgGridExportExample,
        AgGridStatusBarExample,
        AgGridRowActionsExample,
        AgGridColumnStateExample,
        AgGridFilterStateExample,
        AgGridQuickFilterStateExample,
        AgGridExternalFilterStateExample,
        AgGridRowSelectionStateExample,
        AgGridRowFocusStateExample,
        AgGridLoadingOverlayExample,
        AgGridSkeletonCellRendererExample,
        AgGridInfiniteSelectionExample
    ],
    template: `
        <ag-grid-column-menu-example />
        <hr />
        <ag-grid-loading-overlay-example />
        <hr />
        <ag-grid-skeleton-cell-renderer-example />
        <hr />
        <ag-grid-infinite-selection-example />
        <hr />
        <ag-grid-external-filter-state-example />
        <hr />
        <ag-grid-quick-filter-state-example />
        <hr />
        <ag-grid-filter-state-example />
        <hr />
        <ag-grid-column-state-example />
        <hr />
        <ag-grid-row-selection-state-example />
        <hr />
        <ag-grid-row-focus-state-example />
        <hr />
        <ag-grid-overview-example />
        <hr />
        <ag-grid-row-dragging-example />
        <hr />
        <ag-grid-row-group-example />
        <hr />
        <ag-grid-copy-selected-example />
        <hr />
        <ag-grid-export-example />
        <hr />
        <ag-grid-status-bar-example />
        <hr />
        <ag-grid-row-actions-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [DevDocsExamples, DevThemeToggle],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}

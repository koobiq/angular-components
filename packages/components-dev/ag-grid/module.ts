import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
    AgGridColumnStateExample,
    AgGridCopySelectedExample,
    AgGridExternalFilterStateExample,
    AgGridFilterStateExample,
    AgGridOverviewExample,
    AgGridQuickFilterStateExample,
    AgGridRowActionsExample,
    AgGridRowDraggingExample,
    AgGridStatusBarExample
} from 'packages/docs-examples/components/ag-grid';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [
        AgGridOverviewExample,
        AgGridRowDraggingExample,
        AgGridCopySelectedExample,
        AgGridStatusBarExample,
        AgGridRowActionsExample,
        AgGridColumnStateExample,
        AgGridFilterStateExample,
        AgGridQuickFilterStateExample,
        AgGridExternalFilterStateExample
    ],
    template: `
        <ag-grid-external-filter-state-example />
        <hr />
        <ag-grid-quick-filter-state-example />
        <hr />
        <ag-grid-filter-state-example />
        <hr />
        <ag-grid-column-state-example />
        <hr />
        <ag-grid-overview-example />
        <hr />
        <ag-grid-row-dragging-example />
        <hr />
        <ag-grid-copy-selected-example />
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
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}

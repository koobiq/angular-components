import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    type ColDef,
    type FirstDataRenderedEvent,
    ModuleRegistry,
    type RowSelectionOptions
} from 'ag-grid-community';
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { exampleIncidentColumns } from '../incident-columns';
import { exampleGetIncidents } from '../security-incidents';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with row dragging
 */
@Component({
    selector: 'ag-grid-row-dragging-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            [alwaysMultiSort]="true"
            [rowSelection]="rowSelection"
            [style.height.px]="300"
            [columnDefs]="columnDefs()"
            [defaultColDef]="defaultColDef"
            [rowData]="rowData"
            [rowDragManaged]="true"
            [rowDragMultiRow]="true"
            [suppressMoveWhenRowDragging]="true"
            (firstDataRendered)="onFirstDataRendered($event)"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridRowDraggingExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true,
        width: 140
    };

    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        headerCheckbox: true,
        checkboxes: true,
        hideDisabledCheckboxes: false
    };

    protected readonly columnDefs = computed(() =>
        exampleIncidentColumns(
            this.t().headers,
            { field: 'id', rowDrag: true },
            'event',
            'severity',
            'status',
            'affectedHost',
            'category'
        )
    );

    protected readonly rowData = exampleGetIncidents();

    protected onFirstDataRendered({ api }: FirstDataRenderedEvent): void {
        api.forEachNode((node) => {
            if (node.rowIndex === 3 || node.rowIndex === 4) {
                node.setSelected(true);
            }
        });
    }
}

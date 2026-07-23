import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import {
    KbqAgGridRowGroup,
    KbqAgGridRowGroupCollapsedStateLocalStorageStore,
    kbqAgGridRowGroupCollapsedStateStoreProvider,
    kbqAgGridRowGroupColOptionsProvider,
    KbqAgGridRowGroupSelectionStateLocalStorageStore,
    kbqAgGridRowGroupSelectionStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ModuleRegistry, RowSelectionOptions } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const CATEGORIES = ['BruteForce', 'Complex Attack', 'DDoS', 'HIPS alert', 'IDS/IPS Alert', 'XSS'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

/**
 * @title AG Grid with `KbqAgGridRowGroup` directive
 */
@Component({
    selector: 'ag-grid-row-group-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqButtonModule],
    template: `
        <div class="ag-grid-row-group-example-actions">
            <button type="button" kbq-button (click)="rowGroup.collapseAll()">Clear collapsed state</button>
            <button type="button" kbq-button (click)="clearSelectionState(rowGroup)">Clear selection state</button>
        </div>

        <ag-grid-angular
            #rowGroup="kbqAgGridRowGroup"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridRowGroup
            kbqAgGridRowGroupCollapsedState="example-ag-grid-row-group-collapsed-state"
            kbqAgGridRowGroupSelectionState="example-ag-grid-row-group-selection-state"
            [kbqAgGridRowGroupRowData]="rowData"
            [kbqAgGridRowGroupRowId]="rowId"
            [rowSelection]="rowSelection"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [style.height.px]="300"
            [style.width.%]="100"
            [(kbqAgGridRowGroupCols)]="groupCols"
        />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-m);
        }

        .ag-grid-row-group-example-actions {
            display: flex;
            gap: var(--kbq-size-m);
        }
    `,
    providers: [
        kbqAgGridRowGroupCollapsedStateStoreProvider(KbqAgGridRowGroupCollapsedStateLocalStorageStore),
        kbqAgGridRowGroupSelectionStateStoreProvider(KbqAgGridRowGroupSelectionStateLocalStorageStore),
        kbqAgGridRowGroupColOptionsProvider({ headerName: 'Group' })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridRowGroupExample {
    protected readonly groupCols = model(['category', 'severity']);
    protected readonly rowId = (row: Record<string, unknown>): string => row.id as string;
    protected readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true,
        width: 140
    };
    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        headerCheckbox: true,
        checkboxes: true
    };
    protected readonly columnDefs: ColDef[] = [
        { field: 'column0', headerName: 'Column 0', width: 130 },
        { field: 'category', headerName: 'Category', width: 130 },
        { field: 'severity', headerName: 'Severity', width: 130 },
        { field: 'column3', headerName: 'Column 3', width: 130 },
        { field: 'column4', headerName: 'Column 4', width: 130 },
        { field: 'column5', headerName: 'Column 5', width: 130 },
        { field: 'column6', headerName: 'Column 6', width: 130 }
    ];

    protected readonly rowData = Array.from({ length: 24 }, (_, index) => ({
        id: String(index),
        column0: 'Text ' + index,
        category: CATEGORIES[index % CATEGORIES.length],
        severity: SEVERITIES[index % SEVERITIES.length],
        column3: 'Text ' + index,
        column4: 'Text ' + index,
        column5: 'Text ' + index,
        column6: 'Text ' + index
    }));

    /** Deselects every data row, including rows hidden inside a collapsed group. */
    protected clearSelectionState(rowGroup: KbqAgGridRowGroup): void {
        for (const row of this.rowData) {
            rowGroup.setRowSelected(row.id, false);
        }
    }
}

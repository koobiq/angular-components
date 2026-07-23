import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    KbqAgGridRowSelectionStateLocalStorageStore,
    kbqAgGridRowSelectionStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, GetRowIdParams, ModuleRegistry, RowSelectionOptions } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with `KbqAgGridRowSelectionState` directive
 */
@Component({
    selector: 'ag-grid-row-selection-state-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqButtonModule],
    template: `
        <button type="button" kbq-button (click)="rowSelectionState.reset()">Reset selection state</button>

        <ag-grid-angular
            #rowSelectionState="kbqAgGridRowSelectionState"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridRowSelectionState="example-ag-grid-row-selection-state"
            [getRowId]="getRowId"
            [rowSelection]="rowSelection"
            [rowData]="rowData"
            [columnDefs]="columnDefs"
            [style.height.px]="300"
            [style.width.%]="100"
            [defaultColDef]="defaultColDef"
        />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-m);
        }
    `,
    providers: [
        kbqAgGridRowSelectionStateStoreProvider(KbqAgGridRowSelectionStateLocalStorageStore)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridRowSelectionStateExample {
    protected readonly getRowId = (params: GetRowIdParams): string => params.data.column0;
    protected readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true
    };
    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        headerCheckbox: true,
        checkboxes: true
    };
    protected readonly columnDefs: ColDef[] = [
        { field: 'column0', headerName: 'Column 0', width: 130 },
        { field: 'column1', headerName: 'Column 1', width: 130 },
        { field: 'column2', headerName: 'Column 2', width: 130 },
        { field: 'column3', headerName: 'Column 3', width: 130 },
        { field: 'column4', headerName: 'Column 4', width: 130 }
    ];
    protected readonly rowData = Array.from({ length: 100 }, (_, index) => ({
        column0: 'Text ' + index,
        column1: 'Text ' + index,
        column2: 'Text ' + index,
        column3: 'Text ' + index,
        column4: 'Text ' + index
    }));
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    KbqAgGridColumnStateLocalStorageStore,
    kbqAgGridColumnStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with `KbqAgGridColumnState` directive
 */
@Component({
    selector: 'ag-grid-column-state-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqButtonModule],
    template: `
        <button type="button" kbq-button (click)="columnState.reset()">Reset column state</button>
        <ag-grid-angular
            #columnState="kbqAgGridColumnState"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridColumnState="example-ag-grid-column-state"
            [alwaysMultiSort]="true"
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
        kbqAgGridColumnStateStoreProvider(KbqAgGridColumnStateLocalStorageStore)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridColumnStateExample {
    readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true
    };
    readonly columnDefs: ColDef[] = [
        { field: 'column0', headerName: 'Column 0', width: 100 },
        { field: 'column1', headerName: 'Column 1', width: 100 },
        { field: 'column2', headerName: 'Column 2', width: 100 },
        { field: 'column3', headerName: 'Column 3', width: 100 },
        { field: 'column4', headerName: 'Column 4', width: 100 },
        { field: 'column5', headerName: 'Column 5', width: 100 }
    ];
    readonly rowData = Array.from({ length: 100 }, (_, index) => ({
        column0: 'Text ' + index,
        column1: 'Text ' + index,
        column2: 'Text ' + index,
        column3: 'Text ' + index,
        column4: 'Text ' + index,
        column5: 'Text ' + index
    }));
}

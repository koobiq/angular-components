import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    KBQ_AG_GRID_COLUMN_MENU_LABELS_EN,
    kbqAgGridColumnMenuLabelsProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with column menu
 */
@Component({
    selector: 'ag-grid-column-menu-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            kbqAgGridColumnMenu
            [rowData]="rowData"
            [columnDefs]="columnDefs"
            [alwaysMultiSort]="true"
        />
    `,
    styles: `
        ag-grid-angular {
            height: 400px;
            max-width: 100%;
        }
    `,
    providers: [kbqAgGridColumnMenuLabelsProvider(KBQ_AG_GRID_COLUMN_MENU_LABELS_EN)],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridColumnMenuExample {
    readonly columnDefs: ColDef[] = [
        { field: 'column0', headerName: 'Column 0', lockVisible: true, pinned: 'left', width: 150 },
        { field: 'column1', headerName: 'Column 1', lockVisible: true, width: 150 },
        { field: 'column2', headerName: 'Column 2', width: 150 },
        { field: 'column3', headerName: 'Column 3', pinned: 'right', width: 150 },
        { field: 'column4', headerName: 'Column 4', width: 150 }
    ];
    readonly rowData = Array.from({ length: 30 }, (_, index) => ({
        column0: 'Text ' + index,
        column1: 'Text ' + index,
        column2: 'Text ' + index,
        column3: 'Text ' + index,
        column4: 'Text ' + index
    }));
}

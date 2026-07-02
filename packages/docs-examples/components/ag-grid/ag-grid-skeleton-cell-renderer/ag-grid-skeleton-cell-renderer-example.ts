import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAgGridSkeletonCellRenderer, KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    ICellRendererParams,
    IDatasource,
    IGetRowsParams,
    ModuleRegistry
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const ROW_DATA = Array.from({ length: 1000 }, (_, index) => ({
    column0: 'Text ' + index,
    column1: 'Text ' + index,
    column2: 'Text ' + index,
    column3: 'Text ' + index,
    column4: 'Text ' + index,
    column5: 'Text ' + index
}));

/**
 * @title AG Grid with skeleton cell renderer
 */
@Component({
    selector: 'ag-grid-skeleton-cell-renderer-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            rowModelType="infinite"
            [alwaysMultiSort]="true"
            [columnDefs]="columnDefs"
            [datasource]="datasource"
            [defaultColDef]="defaultColDef"
            [cacheBlockSize]="7"
            [cacheOverflowSize]="7"
            [maxBlocksInCache]="7"
            [infiniteInitialRowCount]="7"
        />
    `,
    styles: `
        ag-grid-angular {
            height: 300px;
            max-width: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridSkeletonCellRendererExample {
    readonly columnDefs: ColDef[] = [
        { field: 'column0', headerName: 'Text' },
        { field: 'column1', headerName: 'Text' },
        { field: 'column2', headerName: 'Text' },
        { field: 'column3', headerName: 'Text' },
        { field: 'column4', headerName: 'Text' },
        { field: 'column5', headerName: 'Text' }
    ];
    readonly datasource: IDatasource = {
        rowCount: ROW_DATA.length,
        getRows: ({ startRow, endRow, successCallback }: IGetRowsParams) => {
            setTimeout(
                () => successCallback(ROW_DATA.slice(startRow, endRow), ROW_DATA.length),
                getRandomInt(500, 2000)
            );
        }
    };
    readonly defaultColDef: ColDef = {
        cellRendererSelector: (params: ICellRendererParams) =>
            params.data === undefined ? { component: KbqAgGridSkeletonCellRenderer } : undefined
    };
}

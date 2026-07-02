import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    KbqAgGridInfiniteSelectionState,
    KbqAgGridSkeletonCellRenderer,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    GetRowIdFunc,
    ICellRendererParams,
    IDatasource,
    IGetRowsParams,
    ModuleRegistry,
    RowSelectionOptions
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const ROW_DATA = Array.from({ length: 1000 }, (_, index) => ({
    id: 'ProjectName' + index,
    column0: 'ProjectName ' + index,
    column1: 'Text ' + index,
    column2: 'Text ' + index,
    column3: 'Text ' + index,
    column4: 'Text ' + index,
    column5: 'Text ' + index
}));

/**
 * @title AG Grid with infinite selection
 */
@Component({
    selector: 'ag-grid-infinite-selection-example',
    imports: [AgGridModule, KbqAgGridThemeModule, JsonPipe],
    template: `
        <ag-grid-angular
            #selection="kbqAgGridInfiniteSelection"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridInfiniteSelection
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            [alwaysMultiSort]="true"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [rowSelection]="rowSelection"
            [kbqAgGridInfiniteSelectionDatasource]="datasource"
            [getRowId]="getRowId"
            [cacheBlockSize]="10"
            (kbqAgGridInfiniteSelectionStateChange)="onSelectAllChange($event)"
        />
        <pre class="kbq-scrollbar"><code>{{ selection.state() | json }}</code></pre>
    `,
    styles: `
        :host {
            display: flex;
            gap: var(--kbq-size-xl);
        }

        ag-grid-angular {
            flex-grow: 1;
            height: 300px;
        }

        pre {
            margin: 0;
            width: 180px;
            max-height: 300px;
            overflow: scroll;
            font-size: var(--kbq-typography-text-compact-font-size);
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridInfiniteSelectionExample {
    protected readonly columnDefs: ColDef[] = [
        { field: 'column0', headerName: 'Project name' },
        { field: 'column1', headerName: 'Text' },
        { field: 'column2', headerName: 'Text' },
        { field: 'column3', headerName: 'Text' },
        { field: 'column4', headerName: 'Text' },
        { field: 'column5', headerName: 'Text' }
    ];
    protected readonly datasource: IDatasource = {
        rowCount: ROW_DATA.length,
        getRows: ({ startRow, endRow, successCallback }: IGetRowsParams) => {
            setTimeout(() => successCallback(ROW_DATA.slice(startRow, endRow), ROW_DATA.length), 500);
        }
    };
    protected readonly getRowId: GetRowIdFunc = ({ data }) => data.id;
    protected readonly defaultColDef: ColDef = {
        cellRendererSelector: (params: ICellRendererParams) =>
            params.data === undefined ? { component: KbqAgGridSkeletonCellRenderer } : undefined
    };
    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        isRowSelectable: ({ data }) => data !== undefined
    };

    protected onSelectAllChange(state: KbqAgGridInfiniteSelectionState): void {
        console.debug('onSelectAllChange: ', state);
    }
}

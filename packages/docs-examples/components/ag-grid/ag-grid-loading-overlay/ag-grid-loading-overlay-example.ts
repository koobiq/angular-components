import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    kbqAgGridLoadingOverlayConfigProvider,
    KbqAgGridSkeletonCellRenderer,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqToggleModule } from '@koobiq/components/toggle';
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

const ROW_DATA = Array.from({ length: 1000 }, (_, index) => ({
    column0: 'Text ' + index,
    column1: 'Text ' + index,
    column2: 'Text ' + index,
    column3: 'Text ' + index,
    column4: 'Text ' + index,
    column5: 'Text ' + index
}));

/**
 * @title AG Grid with loading overlay
 */
@Component({
    selector: 'ag-grid-loading-overlay-example',
    imports: [AgGridModule, KbqAgGridThemeModule, FormsModule, KbqToggleModule, KbqButtonModule],
    template: `
        <div class="layout-row layout-align-start-center layout-gap-xl">
            <kbq-toggle [(ngModel)]="loading">Show loading overlay</kbq-toggle>
            <button kbq-button (click)="loadData()">Load data</button>
        </div>

        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            rowModelType="infinite"
            [alwaysMultiSort]="true"
            [kbqAgGridLoadingOverlay]="loading()"
            [datasource]="datasource()"
            [defaultColDef]="defaultColDef"
            [columnDefs]="columnDefs"
            [cacheBlockSize]="20"
            [infiniteInitialRowCount]="6"
        />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xl);
        }

        ag-grid-angular {
            height: 300px;
            width: 100%;
        }
    `,
    providers: [kbqAgGridLoadingOverlayConfigProvider({ rows: 6, cols: 3, firstColWidth: '148px' })],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridLoadingOverlayExample {
    protected readonly loading = model(true);
    protected readonly datasource = signal<IDatasource | undefined>(undefined);

    protected readonly columnDefs: ColDef[] = [
        { field: 'column0', headerName: 'Text' },
        { field: 'column1', headerName: 'Text' },
        { field: 'column2', headerName: 'Text' },
        { field: 'column3', headerName: 'Text' },
        { field: 'column4', headerName: 'Text' },
        { field: 'column5', headerName: 'Text' }
    ];

    protected readonly defaultColDef: ColDef = {
        cellRendererSelector: ({ data }: ICellRendererParams) =>
            data === undefined ? { component: KbqAgGridSkeletonCellRenderer } : undefined
    };

    protected loadData(): void {
        this.loading.set(false);
        this.datasource.set({
            getRows: ({ startRow, endRow, successCallback }: IGetRowsParams) => {
                setTimeout(() => successCallback(ROW_DATA.slice(startRow, endRow), ROW_DATA.length), 1500);
            }
        });
    }
}

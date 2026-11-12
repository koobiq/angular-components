import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqAgGridSkeletonCellRenderer, KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    ICellRendererParams,
    IDatasource,
    IGetRowsParams,
    ModuleRegistry
} from 'ag-grid-community';
import { ExampleText, TEXT } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

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
            [columnDefs]="columnDefs()"
            [datasource]="datasource()"
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
export class AgGridSkeletonCellRendererExample extends BaseLocalizedExample<ExampleText> {
    readonly columnDefs = computed<ColDef[]>(() =>
        Array.from({ length: 6 }, (_, i) => ({
            field: 'column' + i,
            headerName: this.text().headerText
        }))
    );
    readonly datasource = computed<IDatasource>(() => ({
        rowCount: 1000,
        getRows: ({ startRow, endRow, successCallback }: IGetRowsParams) => {
            setTimeout(
                () =>
                    successCallback(
                        Array.from({ length: endRow - startRow }, (_, i) =>
                            Object.fromEntries(
                                Array.from({ length: 6 }, (_, c) => ['column' + c, 'Text ' + (startRow + i)])
                            )
                        ),
                        1000
                    ),
                getRandomInt(500, 2000)
            );
        }
    }));
    readonly defaultColDef: ColDef = {
        cellRendererSelector: ({ data }: ICellRendererParams) =>
            data === undefined ? { component: KbqAgGridSkeletonCellRenderer } : undefined
    };

    constructor() {
        super(TEXT);
    }
}

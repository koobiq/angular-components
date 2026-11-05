import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { KbqLocaleService } from '@koobiq/components/core';
import { AgGridModule, ICellRendererAngularComp } from 'ag-grid-angular';
import {
    AllCommunityModule,
    IDatasource,
    IGetRowsParams,
    IsFullWidthRowParams,
    ModuleRegistry,
    RowSelectionOptions
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const ROW_DATA = Array.from({ length: 1000 }, (_, index) => ({
    column0: 'Text ' + index,
    column1: 'Text ' + index,
    column2: 'Text ' + index
}));

@Component({
    selector: 'ag-grid-load-text-example-loading-text',
    template: `
        {{ label() }}
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            height: 100%;
            padding-left: calc(var(--ag-cell-horizontal-padding) + 1px);
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridLoadTextExampleLoadingText implements ICellRendererAngularComp {
    private readonly localeService = inject(KbqLocaleService);

    protected readonly label = computed(() =>
        this.localeService.localeId() === 'ru-RU' ? 'Загрузка...' : 'Loading...'
    );

    agInit(): void {}

    refresh(): boolean {
        return true;
    }
}

/**
 * @title AG Grid with a text loading indicator
 */
@Component({
    selector: 'ag-grid-load-text-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            rowModelType="infinite"
            [columnDefs]="columnDefs"
            [datasource]="datasource"
            [rowSelection]="rowSelection"
            [isFullWidthRow]="isFullWidthRow"
            [fullWidthCellRenderer]="loadingTextRenderer"
            [cacheBlockSize]="20"
            [infiniteInitialRowCount]="7"
        />
    `,
    styles: `
        ag-grid-angular {
            height: 300px;
            width: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridLoadTextExample {
    protected readonly loadingTextRenderer = AgGridLoadTextExampleLoadingText;

    protected readonly columnDefs = [
        { field: 'column0', headerName: 'Text' },
        { field: 'column1', headerName: 'Text' },
        { field: 'column2', headerName: 'Text' }
    ];

    protected readonly rowSelection: RowSelectionOptions = { mode: 'multiRow', headerCheckbox: false };

    protected readonly datasource: IDatasource = {
        getRows: ({ startRow, endRow, successCallback }: IGetRowsParams) => {
            setTimeout(
                () =>
                    successCallback(ROW_DATA.slice(startRow, endRow), endRow >= ROW_DATA.length ? ROW_DATA.length : -1),
                1000
            );
        }
    };

    protected readonly isFullWidthRow = ({ rowNode }: IsFullWidthRowParams): boolean => rowNode.data === undefined;
}

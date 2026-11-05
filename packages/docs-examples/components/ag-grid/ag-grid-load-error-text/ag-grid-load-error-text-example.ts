import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { KbqLocaleService } from '@koobiq/components/core';
import { AgGridModule, ICellRendererAngularComp } from 'ag-grid-angular';
import {
    AllCommunityModule,
    GridReadyEvent,
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
    selector: 'ag-grid-load-error-text-example-loading-text',
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
export class AgGridLoadErrorTextExampleLoadingText implements ICellRendererAngularComp {
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
    selector: 'ag-grid-load-error-text-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridLoadError
            rowModelType="infinite"
            [columnDefs]="columnDefs"
            [datasource]="datasource"
            [rowSelection]="rowSelection"
            [isFullWidthRow]="isFullWidthRow"
            [fullWidthCellRenderer]="loadingTextRenderer"
            [cacheBlockSize]="20"
            [infiniteInitialRowCount]="7"
            (gridReady)="onGridReady($event)"
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
export class AgGridLoadErrorTextExample {
    private readonly ready = signal(false);

    protected readonly loadingTextRenderer = AgGridLoadErrorTextExampleLoadingText;

    protected readonly columnDefs = [
        { field: 'column0', headerName: 'Text' },
        { field: 'column1', headerName: 'Text' },
        { field: 'column2', headerName: 'Text' }
    ];

    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        checkboxes: true,
        headerCheckbox: false,
        isRowSelectable: ({ data }) => data !== undefined
    };

    protected readonly datasource: IDatasource = {
        rowCount: ROW_DATA.length,
        getRows: ({ startRow, endRow, successCallback }: IGetRowsParams) => {
            setTimeout(() => successCallback(ROW_DATA.slice(startRow, endRow), ROW_DATA.length), 1000);
        }
    };

    // TODO: drop `ready` and `redrawRows()` once koobiq/data-grid#259 is released. Until then `kbqAgGridLoadError`
    // fails to take over the full width renderer when full width rows are already on screen at `gridReady`.
    protected readonly isFullWidthRow = ({ rowNode }: IsFullWidthRowParams): boolean =>
        this.ready() && rowNode.data === undefined;

    protected onGridReady({ api }: GridReadyEvent): void {
        this.ready.set(true);
        api.redrawRows();
    }
}

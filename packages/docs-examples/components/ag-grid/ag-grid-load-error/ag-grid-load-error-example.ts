import { ChangeDetectionStrategy, Component, computed, inject, model, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    KBQ_AG_GRID_LOAD_ERROR_LABELS_EN,
    KBQ_AG_GRID_LOAD_ERROR_LABELS_RU,
    KbqAgGridLoadError,
    KbqAgGridSkeletonCellRenderer,
    KbqAgGridSkeletonSelectionCellComponent,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqLocaleService } from '@koobiq/components/core';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    GridApi,
    ICellRendererParams,
    IDatasource,
    IGetRowsParams,
    ModuleRegistry,
    RowSelectionOptions,
    RowStyle,
    SelectionColumnDef
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const PAGE_SIZE = 20;
const PINNED_LEFT = ['ag-Grid-SelectionColumn', 'column0'];
const PINNED_RIGHT = ['column4'];

const ROW_DATA = Array.from({ length: 1000 }, (_, index) => ({
    column0: 'Text ' + index,
    column1: 'Text ' + index,
    column2: 'Text ' + index,
    column3: 'Text ' + index,
    column4: 'Text ' + index
}));

/**
 * @title AG Grid with a load error row
 */
@Component({
    selector: 'ag-grid-load-error-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqToggleModule, FormsModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridLoadError
            rowModelType="infinite"
            [kbqAgGridLoadErrorLabels]="labels()"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [datasource]="datasource"
            [rowSelection]="rowSelection"
            [selectionColumnDef]="selectionColumnDef"
            [rowStyle]="rowStyle()"
            [cacheBlockSize]="pageSize"
            [rowBuffer]="pageSize"
            [infiniteInitialRowCount]="7"
            (gridReady)="api = $event.api"
        />

        <div class="layout-row layout-gap-xl">
            <kbq-toggle [(ngModel)]="pinnedColumns" (ngModelChange)="applyPinned()">Pinned columns</kbq-toggle>
            <kbq-toggle [(ngModel)]="rowDividers">Row dividers</kbq-toggle>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
        }

        ag-grid-angular {
            height: 300px;
            width: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridLoadErrorExample {
    protected readonly pinnedColumns = model(true);
    protected readonly rowDividers = model(false);

    private readonly loadError = viewChild.required(KbqAgGridLoadError);
    private readonly localeService = inject(KbqLocaleService);
    private readonly pageCache = new Map<number, (typeof ROW_DATA)[number][]>();

    private requestCount = 0;

    protected api?: GridApi;
    protected readonly pageSize = PAGE_SIZE;

    protected readonly labels = computed(() =>
        this.localeService.localeId() === 'ru-RU' ? KBQ_AG_GRID_LOAD_ERROR_LABELS_RU : KBQ_AG_GRID_LOAD_ERROR_LABELS_EN
    );

    protected readonly rowStyle = computed<RowStyle>(() =>
        this.rowDividers()
            ? {
                  borderBottom: 'var(--kbq-size-border-width) solid var(--kbq-line-contrast-less)',
                  borderRadius: '0'
              }
            : { borderBottom: '', borderRadius: '' }
    );

    protected readonly columnDefs: ColDef[] = [
        { field: 'column0', headerName: 'Text', width: 130, pinned: 'left' },
        { field: 'column1', headerName: 'Text', width: 130 },
        { field: 'column2', headerName: 'Text', width: 130 },
        { field: 'column3', headerName: 'Text', width: 130 },
        { field: 'column4', headerName: 'Text', width: 130, pinned: 'right' }
    ];

    protected readonly defaultColDef: ColDef = {
        cellRendererSelector: ({ data }: ICellRendererParams) =>
            data === undefined ? { component: KbqAgGridSkeletonCellRenderer } : undefined
    };

    protected readonly selectionColumnDef: SelectionColumnDef = {
        pinned: 'left',
        cellRendererSelector: ({ data }: ICellRendererParams) =>
            data === undefined ? { component: KbqAgGridSkeletonSelectionCellComponent } : undefined
    };

    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        checkboxes: true,
        headerCheckbox: false,
        isRowSelectable: ({ data }) => data !== undefined
    };

    protected readonly datasource: IDatasource = {
        getRows: (params: IGetRowsParams) => this.getRows(params)
    };

    protected applyPinned(): void {
        const pinned = this.pinnedColumns();

        this.api?.setColumnsPinned(PINNED_LEFT, pinned ? 'left' : null);
        this.api?.setColumnsPinned(PINNED_RIGHT, pinned ? 'right' : null);
    }

    private getRows({ startRow, endRow, successCallback, failCallback }: IGetRowsParams): void {
        const lastRow = endRow >= ROW_DATA.length ? ROW_DATA.length : -1;
        const cached = this.pageCache.get(startRow);

        if (cached) {
            successCallback(cached, lastRow);

            return;
        }

        const shouldFail = ++this.requestCount % 2 === 0;

        setTimeout(() => {
            if (shouldFail) {
                failCallback();
                this.loadError().fail(startRow);

                return;
            }

            const rows = ROW_DATA.slice(startRow, endRow);

            this.pageCache.set(startRow, rows);
            successCallback(rows, lastRow);
        }, 700);
    }
}

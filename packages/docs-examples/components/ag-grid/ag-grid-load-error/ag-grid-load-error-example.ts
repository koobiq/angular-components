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
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
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
import { ExampleText, TEXT } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

const PAGE_SIZE = 20;
const PINNED_LEFT = ['ag-Grid-SelectionColumn', 'column0'];
const PINNED_RIGHT = ['column4'];

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
            [columnDefs]="columnDefs()"
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
            <kbq-toggle [(ngModel)]="pinnedColumns" (ngModelChange)="applyPinned()">
                {{ text().pinnedColumns }}
            </kbq-toggle>
            <kbq-toggle [(ngModel)]="rowDividers">{{ text().rowDividers }}</kbq-toggle>
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
export class AgGridLoadErrorExample extends BaseLocalizedExample<ExampleText> {
    protected readonly pinnedColumns = model(true);
    protected readonly rowDividers = model(false);

    private readonly loadError = viewChild.required(KbqAgGridLoadError);
    private readonly localeService = inject(KbqLocaleService);
    private readonly pageCache = new Map<number, Record<string, string>[]>();

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

    protected readonly columnDefs = computed<ColDef[]>(() =>
        Array.from({ length: 5 }, (_, i) => ({
            field: 'column' + i,
            headerName: this.text().headerText,
            width: 130,
            pinned: i === 0 ? ('left' as const) : i === 4 ? ('right' as const) : undefined
        }))
    );

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
        const lastRow = endRow >= 1000 ? 1000 : -1;
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

            const rows = Array.from({ length: endRow - startRow }, (_, i) =>
                Object.fromEntries(Array.from({ length: 5 }, (_, c) => ['column' + c, 'Text ' + (startRow + i)]))
            );

            this.pageCache.set(startRow, rows);
            successCallback(rows, lastRow);
        }, 700);
    }

    constructor() {
        super(TEXT);
    }
}

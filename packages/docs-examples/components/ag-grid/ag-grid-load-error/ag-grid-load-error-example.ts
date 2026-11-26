import { ChangeDetectionStrategy, Component, computed, inject, model, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    type ColDef,
    type GridApi,
    type ICellRendererParams,
    type IDatasource,
    type IGetRowsParams,
    ModuleRegistry,
    type RowSelectionOptions,
    type RowStyle,
    type SelectionColumnDef
} from 'ag-grid-community';
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
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { exampleIncidentColumns } from '../incident-columns';
import { EXAMPLE_INCIDENT_COUNT, exampleGetIncidents, type ExampleSecurityIncident } from '../security-incidents';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

const PAGE_SIZE = 20;
const PINNED_LEFT = ['ag-Grid-SelectionColumn', 'id'];
const PINNED_RIGHT = ['sourceIp'];

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
                {{ t().pinnedColumns }}
            </kbq-toggle>
            <kbq-toggle [(ngModel)]="rowDividers">{{ t().rowDividers }}</kbq-toggle>
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
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly pinnedColumns = model(true);
    protected readonly rowDividers = model(false);

    private readonly loadError = viewChild.required(KbqAgGridLoadError);
    private readonly localeService = inject(KbqLocaleService);
    private readonly pageCache = new Map<number, ExampleSecurityIncident[]>();

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

    protected readonly columnDefs = computed(() =>
        exampleIncidentColumns(this.t().headers, { field: 'id', pinned: 'left' }, 'event', 'severity', 'status', {
            field: 'sourceIp',
            pinned: 'right'
        })
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
        const lastRow = endRow >= EXAMPLE_INCIDENT_COUNT ? EXAMPLE_INCIDENT_COUNT : -1;
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

            const rows = exampleGetIncidents(startRow, endRow);

            this.pageCache.set(startRow, rows);
            successCallback(rows, lastRow);
        }, 700);
    }
}

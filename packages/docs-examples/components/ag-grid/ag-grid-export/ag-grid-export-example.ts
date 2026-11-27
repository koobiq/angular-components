import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, type ColDef, type GridApi, type GridReadyEvent, ModuleRegistry } from 'ag-grid-community';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import writeExcelFile from 'write-excel-file/browser';
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDataSizePipe } from '@koobiq/components/core';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { exampleIncidentColumns } from '../incident-columns';
import { exampleGetIncidents, exampleTechniqueLabel } from '../security-incidents';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

type ExportTable = {
    headers: string[];
    rows: string[][];
};

/**
 * @title AG Grid with CSV, XLSX and PDF export
 */
@Component({
    selector: 'ag-grid-export-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqButtonModule],
    template: `
        <div class="ag-grid-export-example-actions">
            <button type="button" kbq-button (click)="downloadCsv()">{{ t().download('CSV') }}</button>
            <button type="button" kbq-button (click)="downloadXlsx()">{{ t().download('XLSX') }}</button>
            <button type="button" kbq-button (click)="downloadPdf()">{{ t().download('PDF') }}</button>
        </div>

        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            [alwaysMultiSort]="true"
            [rowData]="rowData"
            [columnDefs]="columnDefs()"
            [defaultColDef]="defaultColDef"
            [style.height.px]="300"
            [style.width.%]="100"
            (gridReady)="onGridReady($event)"
        />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-m);
        }

        .ag-grid-export-example-actions {
            display: flex;
            gap: var(--kbq-size-m);
        }
    `,
    providers: [KbqDataSizePipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridExportExample {
    private readonly fileSize = inject(KbqDataSizePipe);

    private readonly api = signal<GridApi | null>(null);
    private readonly filename = 'security-incidents';

    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true,
        filter: true,
        floatingFilter: true
    };
    protected readonly columnDefs = computed(() =>
        exampleIncidentColumns(
            this.t().headers,
            'id',
            'event',
            'severity',
            'status',
            'filePath',
            {
                field: 'fileSize',
                cellDataType: 'number',
                valueFormatter: ({ data }) =>
                    data?.fileSize !== undefined ? this.fileSize.transform(data.fileSize) : ''
            },
            {
                field: 'techniques',
                width: 240,
                valueGetter: ({ data }) => data?.techniques.map(exampleTechniqueLabel).join('; ')
            }
        )
    );
    protected readonly rowData = exampleGetIncidents(0, 20);

    /** Stores the grid API once the grid finishes initializing. */
    protected onGridReady({ api }: GridReadyEvent): void {
        this.api.set(api);
    }

    /** Downloads the grid data as a .csv file. */
    protected downloadCsv(): void {
        this.api()?.exportDataAsCsv({ fileName: `${this.filename}.csv` });
    }

    /** Downloads the grid data as an .xlsx file. */
    protected async downloadXlsx(): Promise<void> {
        const table = this.getExportTable();

        if (!table) return;

        await writeExcelFile([table.headers, ...table.rows], { sheet: 'Export' }).toFile(`${this.filename}.xlsx`);
    }

    /** Downloads the grid data as a .pdf file. */
    protected downloadPdf(): void {
        const table = this.getExportTable();

        if (!table) return;

        const pdf = new jsPDF({ orientation: 'landscape' });

        autoTable(pdf, { head: [table.headers], body: table.rows, theme: 'plain' });
        pdf.save(`${this.filename}.pdf`);
    }

    /** Reads the currently displayed columns and rows (respecting filter, sort and formatters). */
    private getExportTable(): ExportTable | null {
        const api = this.api();

        if (!api) return null;

        const columns = api.getAllDisplayedColumns();
        const headers = columns.map((column) => column.getColDef().headerName ?? column.getColId());
        const rows: string[][] = [];

        api.forEachNodeAfterFilterAndSort((node) => {
            if (!node.data) return;

            rows.push(
                columns.map((column) => api.getCellValue({ rowNode: node, colKey: column, useFormatter: true }) ?? '')
            );
        });

        return { headers, rows };
    }
}

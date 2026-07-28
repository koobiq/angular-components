import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, GridApi, GridReadyEvent, ModuleRegistry } from 'ag-grid-community';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { utils, writeFile } from 'xlsx';

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
            <button type="button" kbq-button (click)="downloadCsv()">Download CSV</button>
            <button type="button" kbq-button (click)="downloadXlsx()">Download XLSX</button>
            <button type="button" kbq-button (click)="downloadPdf()">Download PDF</button>
        </div>

        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            [alwaysMultiSort]="true"
            [rowData]="rowData"
            [columnDefs]="columnDefs"
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridExportExample {
    private readonly api = signal<GridApi | null>(null);
    private readonly filename = 'example-export';
    protected readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true,
        filter: true,
        floatingFilter: true
    };
    protected readonly columnDefs: ColDef[] = [
        { field: 'column0', headerName: 'Project name', width: 130 },
        { field: 'column1', headerName: 'Column 1', width: 130 },
        { field: 'column2', headerName: 'Column 2', width: 130 },
        { field: 'column3', headerName: 'Column 3', width: 130 },
        { field: 'column4', headerName: 'Column 4', width: 130 }
    ];
    protected readonly rowData = Array.from({ length: 20 }, (_, index) => ({
        column0: 'Project name ' + index,
        column1: 'Text ' + index,
        column2: 'Text ' + index,
        column3: 'Text ' + index,
        column4: 'Text ' + index
    }));

    /** Stores the grid API once the grid finishes initializing. */
    protected onGridReady({ api }: GridReadyEvent): void {
        this.api.set(api);
    }

    /** Downloads the grid data as a .csv file. */
    protected downloadCsv(): void {
        this.api()?.exportDataAsCsv({ fileName: `${this.filename}.csv` });
    }

    /** Downloads the grid data as an .xlsx file. */
    protected downloadXlsx(): void {
        const table = this.getExportTable();

        if (!table) return;

        const worksheet = utils.aoa_to_sheet([table.headers, ...table.rows]);
        const workbook = utils.book_new();

        utils.book_append_sheet(workbook, worksheet, 'Export');
        writeFile(workbook, `${this.filename}.xlsx`);
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

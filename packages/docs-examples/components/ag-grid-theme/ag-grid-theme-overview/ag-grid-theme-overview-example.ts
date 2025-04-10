import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAgGridTheme } from '@koobiq/ag-grid-angular-theme';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, FirstDataRenderedEvent } from 'ag-grid-community';

type ExampleRowData = {
    column0: string;
    column1: string;
    column2: string;
    column3: string;
    column4: string;
    column5: string;
    column6: string;
    column7: string;
    column8: string;
    column9: string;
};

/**
 * @title KbqAgGridTheme overview
 */
@Component({
    standalone: true,
    imports: [AgGridModule, KbqAgGridTheme],
    selector: 'ag-grid-theme-overview-example',
    template: `
        <ag-grid-angular
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [rowData]="rowData"
            [suppressRowClickSelection]="true"
            (firstDataRendered)="onFirstDataRendered($event)"
            rowSelection="multiple"
            kbqAgGridTheme
        />
    `,
    styles: `
        :host {
            display: block;
            height: 340px;
        }

        ag-grid-angular {
            height: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridThemeOverviewExample {
    readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true
    };

    readonly columnDefs: ColDef[] = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            width: 41,
            headerName: '',
            sortable: false,
            resizable: false,
            suppressMovable: true
        },
        {
            field: 'column0',
            headerName: 'Link'
        },
        {
            field: 'column1',
            headerName: 'Text'
        },
        {
            field: 'column2',
            headerName: 'Text'
        },
        {
            field: 'column3',
            headerName: 'Text'
        },
        {
            field: 'column4',
            headerName: 'Text'
        },
        {
            field: 'column5',
            headerName: 'Text'
        },
        {
            field: 'column6',
            headerName: 'Text'
        },
        {
            field: 'column7',
            headerName: 'Text'
        },
        {
            field: 'column8',
            headerName: 'Text'
        },
        {
            field: 'column9',
            headerName: 'Text'
        }
    ];

    readonly rowData: ExampleRowData[] = Array.from({ length: 1000 }, () => ({
        column0: 'Link',
        column1: 'Text',
        column2: 'Text',
        column3: 'Text',
        column4: 'Text',
        column5: 'Text',
        column6: 'Text',
        column7: 'Text',
        column8: 'Text',
        column9: 'Text'
    }));

    onFirstDataRendered({ api }: FirstDataRenderedEvent): void {
        // Set initial focused cell
        api.setFocusedCell(0, 'column0');

        // Set initial selected rows
        api.forEachNode((node) => {
            if (node.rowIndex === 3 || node.rowIndex === 4) {
                node.setSelected(true);
            }
        });
    }
}

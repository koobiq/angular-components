import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAgGridTheme } from '@koobiq/ag-grid-angular-theme';
import { KbqLinkModule } from '@koobiq/components/link';
import { AgGridModule, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, FirstDataRenderedEvent, ICellRendererParams } from 'ag-grid-community';

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

@Component({
    standalone: true,
    imports: [KbqLinkModule],
    selector: 'example-link-cell-renderer',
    template: `
        <a kbq-link href="https://koobiq.io/en/components/ag-grid" target="_blank">{{ cellValue }}</a>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleLinkCellRenderer implements ICellRendererAngularComp {
    cellValue: string;

    agInit(params: ICellRendererParams): void {
        this.cellValue = this.getValueToDisplay(params);
    }

    refresh(params: ICellRendererParams): boolean {
        this.cellValue = this.getValueToDisplay(params);

        return true;
    }

    private getValueToDisplay(params: ICellRendererParams): string {
        return params.valueFormatted ? params.valueFormatted : params.value;
    }
}

/**
 * @title AG Grid overview
 */
@Component({
    standalone: true,
    imports: [AgGridModule, KbqAgGridTheme],
    selector: 'ag-grid-overview-example',
    template: `
        <ag-grid-angular
            [style.height.px]="300"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [rowData]="rowData"
            [suppressRowClickSelection]="true"
            (firstDataRendered)="onFirstDataRendered($event)"
            rowSelection="multiple"
            kbqAgGridTheme
            disableCellFocusStyles
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridOverviewExample {
    readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true,
        width: 140
    };

    readonly columnDefs: ColDef[] = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            width: 34,
            headerName: '',
            sortable: false,
            filter: false,
            resizable: false,
            suppressMovable: true,
            editable: false,
            lockPosition: true
        },
        {
            field: 'column0',
            headerName: 'Link',
            cellRenderer: ExampleLinkCellRenderer
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

    readonly rowData: ExampleRowData[] = Array.from({ length: 1000 }, (_, index) => ({
        column0: 'Link ' + index,
        column1: 'Text ' + index,
        column2: 'Text ' + index,
        column3: 'Text ' + index,
        column4: 'Text ' + index,
        column5: 'Text ' + index,
        column6: 'Text ' + index,
        column7: 'Text ' + index,
        column8: 'Text ' + index,
        column9: 'Text ' + index
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

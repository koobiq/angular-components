import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KBQ_AG_GRID_ROW_ACTIONS_PARAMS, KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToastService } from '@koobiq/components/toast';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    FirstDataRenderedEvent,
    ModuleRegistry,
    RowSelectionOptions
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

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
    selector: 'example-row-actions',
    imports: [KbqIconModule],
    template: `
        <i kbq-icon-button="kbq-square-multiple-o_16" color="contrast-fade" (click)="copy()"></i>
        <i kbq-icon-button="kbq-box-archive_16" color="contrast-fade" (click)="delete()"></i>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: var(--kbq-size-s);
            height: 100%;
            width: 200px;
            padding: 0 var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleRowActionsComponent {
    private readonly clipboard = inject(Clipboard);
    private readonly toast = inject(KbqToastService);
    private readonly params = inject(KBQ_AG_GRID_ROW_ACTIONS_PARAMS);

    protected copy(): void {
        this.clipboard.copy(JSON.stringify(this.params.data));
        this.toast.show({ title: `Row #${this.params.rowIndex} copied` });
    }

    protected delete(): void {
        this.params.api.applyTransaction({ remove: [this.params.data] });
        this.toast.show({ title: `Row #${this.params.rowIndex} archived` });
    }
}

/**
 * @title AG Grid with `KbqAgGridRowActions` directive
 */
@Component({
    selector: 'ag-grid-row-actions-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            disableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectAllRowsByCtrlA
            kbqAgGridSelectRowsByCtrlClick
            [kbqAgGridRowActions]="rowActionsComponent"
            [rowSelection]="rowSelection"
            [style.height.px]="300"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [rowData]="rowData"
            (firstDataRendered)="onFirstDataRendered($event)"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridRowActionsExample {
    protected readonly rowActionsComponent = ExampleRowActionsComponent;

    protected readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true,
        width: 140
    };

    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        headerCheckbox: true,
        checkboxes: true,
        hideDisabledCheckboxes: false
    };

    protected readonly columnDefs: ColDef[] = [
        {
            field: 'column0',
            headerName: 'Project name',
            width: 180
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

    protected readonly rowData: ExampleRowData[] = Array.from({ length: 100 }, (_, index) => ({
        column0: 'Project name ' + index,
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

    protected onFirstDataRendered({ api }: FirstDataRenderedEvent): void {
        api.forEachNode((node) => {
            if (node.rowIndex === 3 || node.rowIndex === 4) {
                node.setSelected(true);
            }
        });

        api.setColumnWidths([{ key: 'ag-Grid-SelectionColumn', newWidth: 36 }]);
    }
}

import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { KBQ_AG_GRID_STATUS_BAR_PARAMS, KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
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
    selector: 'example-ag-grid-status-bar',
    template: `
        <div>Total rows: {{ totalRows() }}</div>
        <div>Selected: {{ selectedRows() }}</div>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-l);
            height: var(--kbq-size-4xl);
            padding: 0 var(--kbq-size-l);
            border-top: var(--kbq-size-border-width) solid var(--kbq-line-contrast-less);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleAgGridStatusBarComponent {
    private readonly params = inject(KBQ_AG_GRID_STATUS_BAR_PARAMS);
    private readonly destroyRef = inject(DestroyRef);

    protected readonly totalRows = signal(0);
    protected readonly selectedRows = signal(0);

    constructor() {
        const { api } = this.params;

        const updateTotal = (): void => this.totalRows.set(api.getDisplayedRowCount());
        const updateSelected = (): void => this.selectedRows.set(api.getSelectedNodes().length);

        updateTotal();
        updateSelected();

        api.addEventListener('modelUpdated', updateTotal);
        api.addEventListener('selectionChanged', updateSelected);

        this.destroyRef.onDestroy(() => {
            api.removeEventListener('modelUpdated', updateTotal);
            api.removeEventListener('selectionChanged', updateSelected);
        });
    }
}

/**
 * @title AG Grid with `KbqAgGridStatusBar` directive
 */
@Component({
    selector: 'ag-grid-status-bar-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            disableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectAllRowsByCtrlA
            kbqAgGridSelectRowsByCtrlClick
            pagination
            [kbqAgGridStatusBar]="statusBarComponent"
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
export class AgGridStatusBarExample {
    protected readonly statusBarComponent = ExampleAgGridStatusBarComponent;

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

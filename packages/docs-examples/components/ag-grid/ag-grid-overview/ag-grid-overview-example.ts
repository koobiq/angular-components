import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { KbqLink } from '@koobiq/components/link';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { AgGridModule, ICellRendererAngularComp } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    FirstDataRenderedEvent,
    ICellRendererParams,
    ModuleRegistry,
    RowSelectionOptions,
    SelectionColumnDef
} from 'ag-grid-community';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
    selector: 'example-link-cell-renderer',
    imports: [KbqLink],
    template: `
        <a kbqLink href="https://koobiq.io/en/components/ag-grid" target="_blank">{{ cellValue }}</a>
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
    selector: 'ag-grid-overview-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            [alwaysMultiSort]="true"
            [rowSelection]="rowSelection"
            [selectionColumnDef]="selectionColumnDef"
            [style.height.px]="300"
            [columnDefs]="columnDefs()"
            [defaultColDef]="defaultColDef"
            [rowData]="rowData()"
            (firstDataRendered)="onFirstDataRendered($event)"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true,
        width: 140
    };

    protected readonly selectionColumnDef: SelectionColumnDef = {
        pinned: 'left'
    };

    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        headerCheckbox: true,
        checkboxes: true,
        hideDisabledCheckboxes: false
    };

    protected readonly columnDefs = computed<ColDef[]>(() => [
        {
            field: 'column0',
            headerName: this.t().link,
            cellRenderer: ExampleLinkCellRenderer,
            pinned: true
        },
        ...Array.from({ length: 9 }, (_, i) => ({
            field: 'column' + (i + 1),
            headerName: this.t().headerText
        }))
    ]);

    protected readonly rowData = computed(() =>
        Array.from({ length: 100 }, (_, index) => ({
            column0: this.t().linkN(index),
            ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => ['column' + (i + 1), 'Text ' + index]))
        }))
    );

    protected onFirstDataRendered({ api }: FirstDataRenderedEvent): void {
        api.forEachNode((node) => {
            if (node.rowIndex === 3 || node.rowIndex === 4) {
                node.setSelected(true);
            }
        });
    }
}

import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    FirstDataRenderedEvent,
    ModuleRegistry,
    RowSelectionOptions
} from 'ag-grid-community';
import { injectExampleText } from '../l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with row dragging
 */
@Component({
    selector: 'ag-grid-row-dragging-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            [alwaysMultiSort]="true"
            [rowSelection]="rowSelection"
            [style.height.px]="300"
            [columnDefs]="columnDefs()"
            [defaultColDef]="defaultColDef"
            [rowData]="rowData()"
            [rowDragManaged]="true"
            [rowDragMultiRow]="true"
            [suppressMoveWhenRowDragging]="true"
            (firstDataRendered)="onFirstDataRendered($event)"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridRowDraggingExample {
    protected readonly text = injectExampleText();

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

    protected readonly columnDefs = computed<ColDef[]>(() => [
        {
            field: 'column0',
            headerName: this.text().projectName,
            width: 180,
            rowDrag: true
        },
        ...Array.from({ length: 9 }, (_, i) => ({
            field: 'column' + (i + 1),
            headerName: this.text().headerText
        }))
    ]);

    protected readonly rowData = computed(() =>
        Array.from({ length: 100 }, (_, index) => ({
            column0: 'Project name ' + index,
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

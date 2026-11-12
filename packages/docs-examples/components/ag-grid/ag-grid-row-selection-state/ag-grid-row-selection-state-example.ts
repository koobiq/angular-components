import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import {
    KbqAgGridRowSelectionStateLocalStorageStore,
    kbqAgGridRowSelectionStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, GetRowIdParams, ModuleRegistry, RowSelectionOptions } from 'ag-grid-community';
import { ExampleText, TEXT } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with `KbqAgGridRowSelectionState` directive
 */
@Component({
    selector: 'ag-grid-row-selection-state-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqButtonModule],
    template: `
        <button type="button" kbq-button (click)="rowSelectionState.reset()">{{ text().resetSelectionState }}</button>

        <ag-grid-angular
            #rowSelectionState="kbqAgGridRowSelectionState"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridRowSelectionState="example-ag-grid-row-selection-state"
            [getRowId]="getRowId"
            [rowSelection]="rowSelection"
            [rowData]="rowData()"
            [columnDefs]="columnDefs()"
            [style.height.px]="300"
            [style.width.%]="100"
            [defaultColDef]="defaultColDef"
        />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-m);
        }
    `,
    providers: [
        kbqAgGridRowSelectionStateStoreProvider(KbqAgGridRowSelectionStateLocalStorageStore)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridRowSelectionStateExample extends BaseLocalizedExample<ExampleText> {
    protected readonly getRowId = (params: GetRowIdParams): string => params.data.column0;
    protected readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true
    };
    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        headerCheckbox: true,
        checkboxes: true
    };
    protected readonly columnDefs = computed<ColDef[]>(() =>
        Array.from({ length: 5 }, (_, i) => ({
            field: 'column' + i,
            headerName: 'Column ' + i,
            width: 130
        }))
    );
    protected readonly rowData = computed(() =>
        Array.from({ length: 100 }, (_, index) =>
            Object.fromEntries(Array.from({ length: 5 }, (_, i) => ['column' + i, 'Text ' + index]))
        )
    );

    constructor() {
        super(TEXT);
    }
}

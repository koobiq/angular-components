import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    KbqAgGridRowSelectionStateLocalStorageStore,
    kbqAgGridRowSelectionStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, GetRowIdParams, ModuleRegistry, RowSelectionOptions } from 'ag-grid-community';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with `KbqAgGridRowSelectionState` directive
 */
@Component({
    selector: 'ag-grid-row-selection-state-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqButtonModule],
    template: `
        <button type="button" kbq-button (click)="rowSelectionState.reset()">{{ t().resetSelectionState }}</button>

        <ag-grid-angular
            #rowSelectionState="kbqAgGridRowSelectionState"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridRowSelectionState="example-ag-grid-row-selection-state"
            [getRowId]="getRowId"
            [rowSelection]="rowSelection"
            [rowData]="rowData"
            [columnDefs]="columnDefs"
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
export class AgGridRowSelectionStateExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

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
    protected readonly columnDefs: ColDef[] = Array.from({ length: 5 }, (_, i) => ({
        field: 'column' + i,
        headerName: 'Column ' + i,
        width: 130
    }));
    protected readonly rowData = Array.from({ length: 100 }, (_, index) =>
        Object.fromEntries(Array.from({ length: 5 }, (_, i) => ['column' + i, 'Text ' + index]))
    );
}

import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    type ColDef,
    type GetRowIdParams,
    ModuleRegistry,
    type RowSelectionOptions
} from 'ag-grid-community';
import {
    KbqAgGridRowSelectionStateLocalStorageStore,
    kbqAgGridRowSelectionStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { exampleIncidentColumns } from '../incident-columns';
import { exampleGetIncidents, type ExampleSecurityIncident } from '../security-incidents';
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
            kbqAgGridRowSelectionState="example-ag-grid-incidents-row-selection-state"
            [getRowId]="getRowId"
            [rowSelection]="rowSelection"
            [rowData]="rowData"
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
export class AgGridRowSelectionStateExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true
    };
    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        headerCheckbox: true,
        checkboxes: true
    };
    protected readonly columnDefs = computed(() => exampleIncidentColumns(this.t().headers));
    protected readonly rowData = exampleGetIncidents();

    protected readonly getRowId = (params: GetRowIdParams<ExampleSecurityIncident>): string => params.data.id;
}

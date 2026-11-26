import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, type GetRowIdParams, ModuleRegistry } from 'ag-grid-community';
import {
    KbqAgGridRowFocusStateLocalStorageStore,
    kbqAgGridRowFocusStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { exampleIncidentColumns } from '../incident-columns';
import { exampleGetIncidents, type ExampleSecurityIncident } from '../security-incidents';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with `KbqAgGridRowFocusState` directive
 */
@Component({
    selector: 'ag-grid-row-focus-state-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqButtonModule],
    template: `
        <button type="button" kbq-button (click)="rowFocusState.reset()">{{ t().resetFocusState }}</button>

        <ag-grid-angular
            #rowFocusState="kbqAgGridRowFocusState"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridRowFocusState="example-ag-grid-incidents-row-focus-state"
            [getRowId]="getRowId"
            [rowData]="rowData"
            [columnDefs]="columnDefs()"
            [style.height.px]="300"
            [style.width.%]="100"
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
        kbqAgGridRowFocusStateStoreProvider(KbqAgGridRowFocusStateLocalStorageStore)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridRowFocusStateExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly columnDefs = computed(() => exampleIncidentColumns(this.t().headers));
    protected readonly rowData = exampleGetIncidents();

    protected readonly getRowId = (params: GetRowIdParams<ExampleSecurityIncident>): string => params.data.id;
}

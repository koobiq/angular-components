import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, type ColDef, ModuleRegistry } from 'ag-grid-community';
import {
    KbqAgGridColumnStateLocalStorageStore,
    kbqAgGridColumnStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { exampleIncidentColumns } from '../incident-columns';
import { exampleGetIncidents } from '../security-incidents';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with `KbqAgGridColumnState` directive
 */
@Component({
    selector: 'ag-grid-column-state-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqButtonModule],
    template: `
        <button type="button" kbq-button (click)="columnState.reset()">{{ t().resetColumnState }}</button>
        <ag-grid-angular
            #columnState="kbqAgGridColumnState"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridColumnState="example-ag-grid-incidents-column-state"
            [alwaysMultiSort]="true"
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
        kbqAgGridColumnStateStoreProvider(KbqAgGridColumnStateLocalStorageStore)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridColumnStateExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true
    };
    protected readonly columnDefs = computed(() => exampleIncidentColumns(this.t().headers));
    protected readonly rowData = exampleGetIncidents();
}

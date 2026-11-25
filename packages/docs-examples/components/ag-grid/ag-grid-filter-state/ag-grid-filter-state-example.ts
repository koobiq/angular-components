import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, type ColDef, ModuleRegistry } from 'ag-grid-community';
import {
    KbqAgGridFilterStateLocalStorageStore,
    kbqAgGridFilterStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { exampleIncidentColumns } from '../incident-columns';
import { exampleGetIncidents } from '../security-incidents';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with `KbqAgGridFilterState` directive
 */
@Component({
    selector: 'ag-grid-filter-state-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqButtonModule],
    template: `
        <button type="button" kbq-button (click)="filterState.reset()">{{ t().resetFilterState }}</button>

        <ag-grid-angular
            #filterState="kbqAgGridFilterState"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridFilterState="example-ag-grid-incidents-filter-state"
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
        kbqAgGridFilterStateStoreProvider(KbqAgGridFilterStateLocalStorageStore)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridFilterStateExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly defaultColDef: ColDef = {
        filter: true,
        floatingFilter: true
    };
    protected readonly columnDefs = computed(() => exampleIncidentColumns(this.t().headers));
    protected readonly rowData = exampleGetIncidents();
}

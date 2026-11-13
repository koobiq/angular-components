import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    KbqAgGridFilterStateLocalStorageStore,
    kbqAgGridFilterStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';
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
            kbqAgGridFilterState="example-ag-grid-filter-state"
            [alwaysMultiSort]="true"
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
    readonly columnDefs: ColDef[] = Array.from({ length: 6 }, (_, i) => ({
        field: 'column' + i,
        headerName: 'Column ' + i,
        width: 130
    }));
    readonly rowData = Array.from({ length: 100 }, (_, index) =>
        Object.fromEntries(Array.from({ length: 6 }, (_, i) => ['column' + i, 'Text ' + index]))
    );
}

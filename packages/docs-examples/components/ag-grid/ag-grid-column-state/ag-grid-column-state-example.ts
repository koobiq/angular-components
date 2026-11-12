import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    KbqAgGridColumnStateLocalStorageStore,
    kbqAgGridColumnStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

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
            kbqAgGridColumnState="example-ag-grid-column-state"
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
        kbqAgGridColumnStateStoreProvider(KbqAgGridColumnStateLocalStorageStore)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridColumnStateExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true
    };
    readonly columnDefs: ColDef[] = Array.from({ length: 6 }, (_, i) => ({
        field: 'column' + i,
        headerName: 'Column ' + i,
        width: 100
    }));
    readonly rowData = Array.from({ length: 100 }, (_, index) =>
        Object.fromEntries(Array.from({ length: 6 }, (_, i) => ['column' + i, 'Text ' + index]))
    );

    constructor() {
        super(TRANSLATIONS);
    }
}

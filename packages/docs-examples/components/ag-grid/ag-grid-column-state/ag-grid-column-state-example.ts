import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import {
    KbqAgGridColumnStateLocalStorageStore,
    kbqAgGridColumnStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';
import { injectExampleText } from '../l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with `KbqAgGridColumnState` directive
 */
@Component({
    selector: 'ag-grid-column-state-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqButtonModule],
    template: `
        <button type="button" kbq-button (click)="columnState.reset()">{{ text().resetColumnState }}</button>
        <ag-grid-angular
            #columnState="kbqAgGridColumnState"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridColumnState="example-ag-grid-column-state"
            [alwaysMultiSort]="true"
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
        kbqAgGridColumnStateStoreProvider(KbqAgGridColumnStateLocalStorageStore)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridColumnStateExample {
    protected readonly text = injectExampleText();

    readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true
    };
    readonly columnDefs = computed<ColDef[]>(() =>
        Array.from({ length: 6 }, (_, i) => ({
            field: 'column' + i,
            headerName: this.text().column(i),
            width: 100
        }))
    );
    readonly rowData = computed(() =>
        Array.from({ length: 100 }, (_, index) =>
            Object.fromEntries(Array.from({ length: 6 }, (_, i) => ['column' + i, this.text().text(index)]))
        )
    );
}

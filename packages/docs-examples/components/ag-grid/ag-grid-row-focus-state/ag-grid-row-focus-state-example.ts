import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import {
    KbqAgGridRowFocusStateLocalStorageStore,
    kbqAgGridRowFocusStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, GetRowIdParams, ModuleRegistry } from 'ag-grid-community';
import { injectExampleText } from '../l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with `KbqAgGridRowFocusState` directive
 */
@Component({
    selector: 'ag-grid-row-focus-state-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqButtonModule],
    template: `
        <button type="button" kbq-button (click)="rowFocusState.reset()">{{ text().resetFocusState }}</button>

        <ag-grid-angular
            #rowFocusState="kbqAgGridRowFocusState"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridRowFocusState="example-ag-grid-row-focus-state"
            [getRowId]="getRowId"
            [rowData]="rowData()"
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
    protected readonly text = injectExampleText();

    protected readonly getRowId = (params: GetRowIdParams): string => params.data.column0;
    protected readonly columnDefs = computed<ColDef[]>(() =>
        Array.from({ length: 5 }, (_, i) => ({
            field: 'column' + i,
            headerName: this.text().column(i),
            width: 130
        }))
    );
    protected readonly rowData = computed(() =>
        Array.from({ length: 100 }, (_, index) =>
            Object.fromEntries(Array.from({ length: 5 }, (_, i) => ['column' + i, this.text().text(index)]))
        )
    );
}

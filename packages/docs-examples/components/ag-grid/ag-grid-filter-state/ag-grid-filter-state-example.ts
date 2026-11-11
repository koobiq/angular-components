import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import {
    KbqAgGridFilterStateLocalStorageStore,
    kbqAgGridFilterStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';
import { injectExampleText } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with `KbqAgGridFilterState` directive
 */
@Component({
    selector: 'ag-grid-filter-state-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqButtonModule],
    template: `
        <button type="button" kbq-button (click)="filterState.reset()">{{ text().resetFilterState }}</button>

        <ag-grid-angular
            #filterState="kbqAgGridFilterState"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridFilterState="example-ag-grid-filter-state"
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
        kbqAgGridFilterStateStoreProvider(KbqAgGridFilterStateLocalStorageStore)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridFilterStateExample {
    protected readonly text = injectExampleText();

    readonly defaultColDef: ColDef = {
        filter: true,
        floatingFilter: true
    };
    readonly columnDefs = computed<ColDef[]>(() =>
        Array.from({ length: 6 }, (_, i) => ({
            field: 'column' + i,
            headerName: this.text().column(i),
            width: 130
        }))
    );
    readonly rowData = computed(() =>
        Array.from({ length: 100 }, (_, index) =>
            Object.fromEntries(Array.from({ length: 6 }, (_, i) => ['column' + i, this.text().text(index)]))
        )
    );
}

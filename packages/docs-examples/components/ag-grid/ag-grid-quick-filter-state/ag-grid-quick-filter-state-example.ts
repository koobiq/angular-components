import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    KbqAgGridQuickFilterStateLocalStorageStore,
    kbqAgGridQuickFilterStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';
import { injectExampleText } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with `KbqAgGridQuickFilterState` directive
 */
@Component({
    selector: 'ag-grid-quick-filter-state-example',
    imports: [AgGridModule, KbqAgGridThemeModule, FormsModule, KbqFormFieldModule, KbqInputModule],
    template: `
        <kbq-form-field [style.width.px]="300">
            <input kbqInput [placeholder]="text().quickFilter" [(ngModel)]="filter" />
            <kbq-cleaner (click)="quickFilterState.reset()" />
        </kbq-form-field>

        <ag-grid-angular
            #quickFilterState="kbqAgGridQuickFilterState"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridQuickFilterState="example-ag-grid-quick-filter-state"
            [alwaysMultiSort]="true"
            [rowData]="rowData()"
            [columnDefs]="columnDefs()"
            [style.height.px]="300"
            [style.width.%]="100"
            [(kbqAgGridQuickFilterStateValue)]="filter"
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
        kbqAgGridQuickFilterStateStoreProvider(KbqAgGridQuickFilterStateLocalStorageStore)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridQuickFilterStateExample {
    protected readonly text = injectExampleText();

    readonly filter = model('');
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

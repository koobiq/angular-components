import { ChangeDetectionStrategy, Component, model } from '@angular/core';
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

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with `KbqAgGridQuickFilterState` directive
 */
@Component({
    selector: 'ag-grid-quick-filter-state-example',
    imports: [AgGridModule, KbqAgGridThemeModule, FormsModule, KbqFormFieldModule, KbqInputModule],
    template: `
        <kbq-form-field [style.width.px]="300">
            <input kbqInput placeholder="Quick filter" [(ngModel)]="filter" />
            <kbq-cleaner (click)="quickFilterState.reset()" />
        </kbq-form-field>

        <ag-grid-angular
            #quickFilterState="kbqAgGridQuickFilterState"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridQuickFilterState="example-ag-grid-quick-filter-state"
            [alwaysMultiSort]="true"
            [rowData]="rowData"
            [columnDefs]="columnDefs"
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
    readonly filter = model('');
    readonly columnDefs: ColDef[] = [
        { field: 'column0', headerName: 'Column 0', width: 130 },
        { field: 'column1', headerName: 'Column 1', width: 130 },
        { field: 'column2', headerName: 'Column 2', width: 130 },
        { field: 'column3', headerName: 'Column 3', width: 130 },
        { field: 'column4', headerName: 'Column 4', width: 130 },
        { field: 'column5', headerName: 'Column 5', width: 130 }
    ];
    readonly rowData = Array.from({ length: 100 }, (_, index) => ({
        column0: 'Text ' + index,
        column1: 'Text ' + index,
        column2: 'Text ' + index,
        column3: 'Text ' + index,
        column4: 'Text ' + index,
        column5: 'Text ' + index
    }));
}

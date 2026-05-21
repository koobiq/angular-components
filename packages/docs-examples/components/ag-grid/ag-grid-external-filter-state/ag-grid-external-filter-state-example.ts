import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    KbqAgGridExternalFilterStateLocalStorageStore,
    kbqAgGridExternalFilterStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, IRowNode, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with `KbqAgGridExternalFilterState` directive
 */
@Component({
    selector: 'ag-grid-external-filter-state-example',
    imports: [AgGridModule, KbqAgGridThemeModule, FormsModule, KbqFormFieldModule, KbqSelectModule],
    template: `
        <kbq-form-field [style.width.px]="300">
            <kbq-select placeholder="External filter" [(ngModel)]="filter">
                <kbq-cleaner #kbqSelectCleaner (click)="externalFilterState.reset()" />
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        <ag-grid-angular
            #externalFilterState="kbqAgGridExternalFilterState"
            kbqAgGridTheme
            kbqAgGridExternalFilterState="dev-ag-grid-external-filter-state"
            [rowData]="rowData"
            [columnDefs]="columnDefs"
            [style.height.px]="300"
            [style.width.%]="100"
            [kbqAgGridExternalFilterStatePass]="filterPass"
            [(kbqAgGridExternalFilterStateValue)]="filter"
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
        kbqAgGridExternalFilterStateStoreProvider(KbqAgGridExternalFilterStateLocalStorageStore)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridExternalFilterStateExample {
    readonly options = ['BruteForce', 'Complex Attack', 'DDoS', 'HIPS alert', 'IDS/IPS Alert', 'XSS'];
    readonly filter = model('');
    readonly filterPass = (node: IRowNode): boolean => node.data.filter === this.filter();
    readonly columnDefs: ColDef[] = [
        { field: 'column0', headerName: 'Column 0', width: 130 },
        { field: 'filter', headerName: 'Filter', width: 130 },
        { field: 'column2', headerName: 'Column 2', width: 130 },
        { field: 'column3', headerName: 'Column 3', width: 130 },
        { field: 'column4', headerName: 'Column 4', width: 130 }
    ];
    readonly rowData = Array.from({ length: 100 }, (_, index) => ({
        column0: 'Text ' + index,
        filter: this.options[index % this.options.length],
        column2: 'Text ' + index,
        column3: 'Text ' + index,
        column4: 'Text ' + index
    }));
}

import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
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
import { injectExampleText } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with `KbqAgGridExternalFilterState` directive
 */
@Component({
    selector: 'ag-grid-external-filter-state-example',
    imports: [AgGridModule, KbqAgGridThemeModule, FormsModule, KbqFormFieldModule, KbqSelectModule],
    template: `
        <kbq-form-field [style.width.px]="300">
            <kbq-select [placeholder]="text().externalFilter" [(ngModel)]="filter">
                <kbq-cleaner (click)="externalFilterState.reset()" />
                @for (option of options(); track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        <ag-grid-angular
            #externalFilterState="kbqAgGridExternalFilterState"
            kbqAgGridTheme
            kbqAgGridExternalFilterState="example-ag-grid-external-filter-state"
            [alwaysMultiSort]="true"
            [rowData]="rowData()"
            [columnDefs]="columnDefs()"
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
    protected readonly text = injectExampleText();

    readonly options = computed(() => this.text().categories);
    readonly filter = model('');
    readonly filterPass = (node: IRowNode): boolean => node.data.filter === this.filter();
    readonly columnDefs = computed<ColDef[]>(() => [
        { field: 'column0', headerName: this.text().column(0), width: 130 },
        { field: 'filter', headerName: this.text().filter, width: 130 },
        ...Array.from({ length: 3 }, (_, i) => ({
            field: 'column' + (i + 2),
            headerName: this.text().column(i + 2),
            width: 130
        }))
    ]);
    readonly rowData = computed(() =>
        Array.from({ length: 100 }, (_, index) => ({
            column0: this.text().text(index),
            filter: this.options()[index % this.options().length],
            column2: this.text().text(index),
            column3: this.text().text(index),
            column4: this.text().text(index)
        }))
    );
}

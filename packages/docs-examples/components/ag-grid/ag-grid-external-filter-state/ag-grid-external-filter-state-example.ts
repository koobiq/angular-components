import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    KbqAgGridExternalFilterStateLocalStorageStore,
    kbqAgGridExternalFilterStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, IRowNode, ModuleRegistry } from 'ag-grid-community';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with `KbqAgGridExternalFilterState` directive
 */
@Component({
    selector: 'ag-grid-external-filter-state-example',
    imports: [AgGridModule, KbqAgGridThemeModule, FormsModule, KbqFormFieldModule, KbqSelectModule],
    template: `
        <kbq-form-field [style.width.px]="300">
            <kbq-select [placeholder]="t().externalFilter" [(ngModel)]="filter">
                <kbq-cleaner (click)="externalFilterState.reset()" />
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ t().categories[option] }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        <ag-grid-angular
            #externalFilterState="kbqAgGridExternalFilterState"
            kbqAgGridTheme
            kbqAgGridExternalFilterState="example-ag-grid-external-filter-state"
            [alwaysMultiSort]="true"
            [rowData]="rowData"
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
    protected readonly t = injectTranslation(TRANSLATIONS);

    // Option values and the row field are category indexes, so the filter state survives a locale switch.
    readonly options = this.t().categories.map((_, index) => index);
    readonly filter = model<number | null>(null);
    readonly filterPass = (node: IRowNode): boolean => node.data.filter === this.filter();
    readonly columnDefs = computed<ColDef[]>(() => [
        { field: 'column0', headerName: 'Column 0', width: 130 },
        { field: 'filter', headerName: this.t().filter, width: 130 },
        ...Array.from({ length: 3 }, (_, i) => ({
            field: 'column' + (i + 2),
            headerName: 'Column ' + (i + 2),
            width: 130
        }))
    ]);
    readonly rowData = Array.from({ length: 100 }, (_, index) => ({
        column0: 'Text ' + index,
        filter: index % this.options.length,
        column2: 'Text ' + index,
        column3: 'Text ' + index,
        column4: 'Text ' + index
    }));
}

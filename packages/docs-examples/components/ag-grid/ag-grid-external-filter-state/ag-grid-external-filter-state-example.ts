import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, type IRowNode, ModuleRegistry } from 'ag-grid-community';
import {
    KbqAgGridExternalFilterStateLocalStorageStore,
    kbqAgGridExternalFilterStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { exampleIncidentColumns } from '../incident-columns';
import { exampleGetIncidents, type ExampleSecurityIncident } from '../security-incidents';
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
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        <ag-grid-angular
            #externalFilterState="kbqAgGridExternalFilterState"
            kbqAgGridTheme
            kbqAgGridExternalFilterState="example-ag-grid-incidents-external-filter-state"
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
    protected readonly rowData = exampleGetIncidents();
    readonly options = [...new Set(this.rowData.map((row) => row.category))];
    readonly filter = model<string | null>(null);

    protected readonly columnDefs = computed(() =>
        exampleIncidentColumns(this.t().headers, 'id', 'category', 'event', 'severity', 'status')
    );

    readonly filterPass = (node: IRowNode<ExampleSecurityIncident>): boolean => node.data?.category === this.filter();
}

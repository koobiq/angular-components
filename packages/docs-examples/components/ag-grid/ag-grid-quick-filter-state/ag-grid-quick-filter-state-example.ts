import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import {
    KbqAgGridQuickFilterStateLocalStorageStore,
    kbqAgGridQuickFilterStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { exampleIncidentColumns } from '../incident-columns';
import { exampleGetIncidents } from '../security-incidents';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with `KbqAgGridQuickFilterState` directive
 */
@Component({
    selector: 'ag-grid-quick-filter-state-example',
    imports: [AgGridModule, KbqAgGridThemeModule, FormsModule, KbqFormFieldModule, KbqInputModule],
    template: `
        <kbq-form-field [style.width.px]="300">
            <input kbqInput [placeholder]="t().quickFilter" [(ngModel)]="filter" />
            <kbq-cleaner (click)="quickFilterState.reset()" />
        </kbq-form-field>

        <ag-grid-angular
            #quickFilterState="kbqAgGridQuickFilterState"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridQuickFilterState="example-ag-grid-incidents-quick-filter-state"
            [alwaysMultiSort]="true"
            [rowData]="rowData"
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
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly filter = model('');
    protected readonly columnDefs = computed(() => exampleIncidentColumns(this.t().headers));
    protected readonly rowData = exampleGetIncidents();
}

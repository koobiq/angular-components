import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, type ColDef, ModuleRegistry, type RowSelectionOptions } from 'ag-grid-community';
import {
    type KbqAgGridRowGroup,
    type KbqAgGridRowGroupCellContent,
    KbqAgGridRowGroupCollapsedStateLocalStorageStore,
    kbqAgGridRowGroupCollapsedStateStoreProvider,
    kbqAgGridRowGroupColOptionsProvider,
    type KbqAgGridRowGroupInfo,
    KbqAgGridRowGroupSelectionStateLocalStorageStore,
    kbqAgGridRowGroupSelectionStateStoreProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { ExampleIncidentBadge } from '../incident-cells';
import { exampleIncidentColumns } from '../incident-columns';
import { exampleGetIncidents, exampleIncidentStatuses } from '../security-incidents';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
    selector: 'example-incident-group-label',
    imports: [ExampleIncidentBadge],
    template: `
        @if (status(); as value) {
            <example-incident-badge compact [value]="value" />
        } @else {
            {{ group().key }}
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ExampleIncidentGroupLabel implements KbqAgGridRowGroupCellContent {
    readonly group = input.required<KbqAgGridRowGroupInfo>();
    protected readonly status = computed(() => exampleIncidentStatuses.find((status) => status === this.group().key));
}

/**
 * @title AG Grid with `KbqAgGridRowGroup` directive
 */
@Component({
    selector: 'ag-grid-row-group-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqButtonModule],
    template: `
        <div class="ag-grid-row-group-example-actions">
            <button type="button" kbq-button (click)="rowGroup.collapseAll()">{{ t().clearCollapsedState }}</button>
            <button type="button" kbq-button (click)="clearSelectionState(rowGroup)">
                {{ t().clearSelectionState }}
            </button>
        </div>

        <ag-grid-angular
            #rowGroup="kbqAgGridRowGroup"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridRowGroup
            kbqAgGridRowGroupCollapsedState="example-ag-grid-incidents-row-group-collapsed-state"
            kbqAgGridRowGroupSelectionState="example-ag-grid-incidents-row-group-selection-state"
            [kbqAgGridRowGroupCellContent]="groupLabel"
            [kbqAgGridRowGroupRowData]="rowData"
            [kbqAgGridRowGroupRowId]="rowId"
            [rowSelection]="rowSelection"
            [columnDefs]="columnDefs()"
            [defaultColDef]="defaultColDef"
            [style.height.px]="300"
            [style.width.%]="100"
            [(kbqAgGridRowGroupCols)]="groupCols"
        />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-m);
        }

        .ag-grid-row-group-example-actions {
            display: flex;
            gap: var(--kbq-size-m);
        }
    `,
    providers: [
        kbqAgGridRowGroupCollapsedStateStoreProvider(KbqAgGridRowGroupCollapsedStateLocalStorageStore),
        kbqAgGridRowGroupSelectionStateStoreProvider(KbqAgGridRowGroupSelectionStateLocalStorageStore),
        kbqAgGridRowGroupColOptionsProvider({ headerName: 'Group' })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridRowGroupExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly groupLabel = ExampleIncidentGroupLabel;
    protected readonly groupCols = model(['status']);
    protected readonly rowId = (row: Record<string, unknown>): string => row['id'] as string;
    protected readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true,
        width: 140
    };
    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        headerCheckbox: true,
        checkboxes: true
    };
    protected readonly columnDefs = computed(() =>
        exampleIncidentColumns(
            this.t().headers,
            'status',
            'id',
            'severity',
            'aiVerdict',
            'assignee',
            'event',
            'affectedHost'
        )
    );

    protected readonly rowData = exampleGetIncidents(0, 24);

    /** Deselects every data row, including rows hidden inside a collapsed group. */
    protected clearSelectionState(rowGroup: KbqAgGridRowGroup): void {
        for (const row of this.rowData) {
            rowGroup.setRowSelected(row.id, false);
        }
    }
}

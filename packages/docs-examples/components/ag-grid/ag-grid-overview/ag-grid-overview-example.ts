import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    type ColDef,
    type FirstDataRenderedEvent,
    ModuleRegistry,
    type RowSelectionOptions,
    type SelectionColumnDef
} from 'ag-grid-community';
import { DateTime } from 'luxon';
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateFormatter, KbqFormattersModule } from '@koobiq/components/core';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { exampleIncidentColumns } from '../incident-columns';
import { exampleGetIncidents } from '../security-incidents';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid overview
 */
@Component({
    selector: 'ag-grid-overview-example',
    imports: [
        AgGridModule,
        KbqAgGridThemeModule,
        LuxonDateModule,
        KbqFormattersModule
    ],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            [alwaysMultiSort]="true"
            [rowSelection]="rowSelection"
            [selectionColumnDef]="selectionColumnDef"
            [style.height.px]="300"
            [columnDefs]="columnDefs()"
            [defaultColDef]="defaultColDef"
            [rowData]="rowData"
            (firstDataRendered)="onFirstDataRendered($event)"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridOverviewExample {
    private readonly dateFormatter = inject<DateFormatter<DateTime>>(DateFormatter);

    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true,
        width: 140
    };
    protected readonly selectionColumnDef: SelectionColumnDef = {
        pinned: 'left'
    };
    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        headerCheckbox: true,
        checkboxes: true,
        hideDisabledCheckboxes: false
    };
    protected readonly columnDefs = computed(() =>
        exampleIncidentColumns(
            this.t().headers,
            { field: 'id', pinned: 'left' },
            'connection',
            'aiVerdict',
            'event',
            'severity',
            'status',
            'assignee',
            'affectedHost',
            {
                field: 'detectedAt',
                width: 190,
                valueFormatter: ({ data }) =>
                    data ? this.dateFormatter.absoluteShortDateTime(DateTime.fromISO(data.detectedAt)) : ''
            }
        )
    );
    protected readonly rowData = exampleGetIncidents();

    protected onFirstDataRendered({ api }: FirstDataRenderedEvent): void {
        api.forEachNode((node) => {
            if (node.rowIndex === 3 || node.rowIndex === 4) {
                node.setSelected(true);
            }
        });
    }
}

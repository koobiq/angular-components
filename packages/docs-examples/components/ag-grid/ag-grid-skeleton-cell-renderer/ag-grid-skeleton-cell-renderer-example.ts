import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    type ColDef,
    type ICellRendererParams,
    type IDatasource,
    type IGetRowsParams,
    ModuleRegistry
} from 'ag-grid-community';
import { KbqAgGridSkeletonCellRenderer, KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { exampleIncidentColumns } from '../incident-columns';
import { EXAMPLE_INCIDENT_COUNT, exampleGetIncidents } from '../security-incidents';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * @title AG Grid with skeleton cell renderer
 */
@Component({
    selector: 'ag-grid-skeleton-cell-renderer-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            rowModelType="infinite"
            [alwaysMultiSort]="true"
            [columnDefs]="columnDefs()"
            [datasource]="datasource"
            [defaultColDef]="defaultColDef"
            [cacheBlockSize]="7"
            [cacheOverflowSize]="7"
            [maxBlocksInCache]="7"
            [infiniteInitialRowCount]="7"
        />
    `,
    styles: `
        ag-grid-angular {
            height: 300px;
            max-width: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridSkeletonCellRendererExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly columnDefs = computed(() => exampleIncidentColumns(this.t().headers));
    readonly datasource: IDatasource = {
        rowCount: EXAMPLE_INCIDENT_COUNT,
        getRows: ({ startRow, endRow, successCallback }: IGetRowsParams) => {
            setTimeout(
                () => successCallback(exampleGetIncidents(startRow, endRow), EXAMPLE_INCIDENT_COUNT),
                getRandomInt(500, 2000)
            );
        }
    };
    readonly defaultColDef: ColDef = {
        cellRendererSelector: ({ data }: ICellRendererParams) =>
            data === undefined ? { component: KbqAgGridSkeletonCellRenderer } : undefined
    };
}

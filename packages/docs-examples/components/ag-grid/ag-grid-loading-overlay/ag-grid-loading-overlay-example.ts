import { ChangeDetectionStrategy, Component, computed, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    type ColDef,
    type ICellRendererParams,
    type IDatasource,
    type IGetRowsParams,
    ModuleRegistry
} from 'ag-grid-community';
import {
    kbqAgGridLoadingOverlayConfigProvider,
    KbqAgGridSkeletonCellRenderer,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { exampleIncidentColumns } from '../incident-columns';
import { EXAMPLE_INCIDENT_COUNT, exampleGetIncidents } from '../security-incidents';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with loading overlay
 */
@Component({
    selector: 'ag-grid-loading-overlay-example',
    imports: [AgGridModule, KbqAgGridThemeModule, FormsModule, KbqToggleModule],
    template: `
        <kbq-toggle [(ngModel)]="loading" (ngModelChange)="onLoadingChange($event)">
            {{ t().showLoadingOverlay }}
        </kbq-toggle>

        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            rowModelType="infinite"
            [alwaysMultiSort]="true"
            [kbqAgGridLoadingOverlay]="loading()"
            [datasource]="datasource()"
            [defaultColDef]="defaultColDef"
            [columnDefs]="columnDefs()"
            [cacheBlockSize]="20"
            [infiniteInitialRowCount]="6"
        />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-xl);
        }

        ag-grid-angular {
            height: 300px;
            width: 100%;
        }
    `,
    providers: [kbqAgGridLoadingOverlayConfigProvider({ rows: 6, cols: 3, firstColWidth: '148px' })],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridLoadingOverlayExample {
    protected readonly loading = model(true);

    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly datasource = signal<IDatasource | undefined>(undefined);
    protected readonly columnDefs = computed(() => exampleIncidentColumns(this.t().headers));
    protected readonly defaultColDef: ColDef = {
        cellRendererSelector: ({ data }: ICellRendererParams) =>
            data === undefined ? { component: KbqAgGridSkeletonCellRenderer } : undefined
    };

    protected onLoadingChange(loading: boolean): void {
        if (loading || this.datasource()) {
            return;
        }

        this.datasource.set({
            getRows: ({ startRow, endRow, successCallback }: IGetRowsParams) => {
                setTimeout(() => successCallback(exampleGetIncidents(startRow, endRow), EXAMPLE_INCIDENT_COUNT), 1500);
            }
        });
    }
}

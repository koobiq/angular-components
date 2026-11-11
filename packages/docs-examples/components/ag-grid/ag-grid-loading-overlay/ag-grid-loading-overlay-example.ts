import { ChangeDetectionStrategy, Component, computed, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    kbqAgGridLoadingOverlayConfigProvider,
    KbqAgGridSkeletonCellRenderer,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    ICellRendererParams,
    IDatasource,
    IGetRowsParams,
    ModuleRegistry
} from 'ag-grid-community';
import { injectExampleText } from '../l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with loading overlay
 */
@Component({
    selector: 'ag-grid-loading-overlay-example',
    imports: [AgGridModule, KbqAgGridThemeModule, FormsModule, KbqToggleModule],
    template: `
        <kbq-toggle [(ngModel)]="loading" (ngModelChange)="onLoadingChange($event)">
            {{ text().showLoadingOverlay }}
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
    protected readonly text = injectExampleText();

    protected readonly loading = model(true);
    protected readonly datasource = signal<IDatasource | undefined>(undefined);

    protected readonly columnDefs = computed<ColDef[]>(() =>
        Array.from({ length: 6 }, (_, i) => ({
            field: 'column' + i,
            headerName: this.text().headerText
        }))
    );

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
                setTimeout(
                    () =>
                        successCallback(
                            Array.from({ length: endRow - startRow }, (_, i) =>
                                Object.fromEntries(
                                    Array.from({ length: 6 }, (_, c) => ['column' + c, this.text().text(startRow + i)])
                                )
                            ),
                            1000
                        ),
                    1500
                );
            }
        });
    }
}

import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { AgGridModule, type ICellRendererAngularComp } from 'ag-grid-angular';
import {
    AllCommunityModule,
    type IDatasource,
    type IGetRowsParams,
    type IsFullWidthRowParams,
    ModuleRegistry,
    type RowSelectionOptions
} from 'ag-grid-community';
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { exampleIncidentColumns } from '../incident-columns';
import { EXAMPLE_INCIDENT_COUNT, exampleGetIncidents } from '../security-incidents';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
    selector: 'ag-grid-load-text-example-loading-text',
    template: `
        {{ label() }}
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            height: 100%;
            padding-left: calc(var(--ag-cell-horizontal-padding) + 1px);
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridLoadTextExampleLoadingText implements ICellRendererAngularComp {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly label = computed(() => this.t().loading);

    agInit(): void {}

    refresh(): boolean {
        return true;
    }
}

/**
 * @title AG Grid with a text loading indicator
 */
@Component({
    selector: 'ag-grid-load-text-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            rowModelType="infinite"
            [columnDefs]="columnDefs()"
            [datasource]="datasource"
            [rowSelection]="rowSelection"
            [isFullWidthRow]="isFullWidthRow"
            [fullWidthCellRenderer]="loadingTextRenderer"
            [cacheBlockSize]="20"
            [infiniteInitialRowCount]="7"
        />
    `,
    styles: `
        ag-grid-angular {
            height: 300px;
            width: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridLoadTextExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly loadingTextRenderer = AgGridLoadTextExampleLoadingText;
    protected readonly columnDefs = computed(() => exampleIncidentColumns(this.t().headers, 'id', 'event', 'status'));
    protected readonly rowSelection: RowSelectionOptions = { mode: 'multiRow', headerCheckbox: false };
    protected readonly datasource: IDatasource = {
        getRows: ({ startRow, endRow, successCallback }: IGetRowsParams) => {
            setTimeout(() => successCallback(exampleGetIncidents(startRow, endRow), EXAMPLE_INCIDENT_COUNT), 1000);
        }
    };

    protected readonly isFullWidthRow = ({ rowNode }: IsFullWidthRowParams): boolean => rowNode.data === undefined;
}

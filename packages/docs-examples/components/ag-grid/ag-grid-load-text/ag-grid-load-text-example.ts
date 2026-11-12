import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { AgGridModule, ICellRendererAngularComp } from 'ag-grid-angular';
import {
    AllCommunityModule,
    IDatasource,
    IGetRowsParams,
    IsFullWidthRowParams,
    ModuleRegistry,
    RowSelectionOptions
} from 'ag-grid-community';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

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
export class AgGridLoadTextExampleLoadingText
    extends BaseLocalizedExample<ExampleTranslation>
    implements ICellRendererAngularComp
{
    protected readonly label = computed(() => this.t().loading);

    agInit(): void {}

    refresh(): boolean {
        return true;
    }

    constructor() {
        super(TRANSLATIONS);
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
            [datasource]="datasource()"
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
export class AgGridLoadTextExample extends BaseLocalizedExample<ExampleTranslation> {
    protected readonly loadingTextRenderer = AgGridLoadTextExampleLoadingText;

    protected readonly columnDefs = computed(() =>
        Array.from({ length: 3 }, (_, i) => ({
            field: 'column' + i,
            headerName: this.t().headerText
        }))
    );

    protected readonly rowSelection: RowSelectionOptions = { mode: 'multiRow', headerCheckbox: false };

    protected readonly datasource = computed<IDatasource>(() => ({
        getRows: ({ startRow, endRow, successCallback }: IGetRowsParams) => {
            setTimeout(
                () =>
                    successCallback(
                        Array.from({ length: endRow - startRow }, (_, i) =>
                            Object.fromEntries(
                                Array.from({ length: 3 }, (_, c) => [
                                    'column' + c,
                                    this.t().headerText + ' ' + (startRow + i)
                                ])
                            )
                        ),
                        endRow >= 1000 ? 1000 : -1
                    ),
                1000
            );
        }
    }));

    protected readonly isFullWidthRow = ({ rowNode }: IsFullWidthRowParams): boolean => rowNode.data === undefined;

    constructor() {
        super(TRANSLATIONS);
    }
}

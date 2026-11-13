import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    KBQ_AG_GRID_ROW_DETAIL_LABELS_EN,
    KBQ_AG_GRID_ROW_DETAIL_PARAMS,
    KbqAgGridRowDetail,
    kbqAgGridRowDetailLabelsProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    CellClickedEvent,
    CellKeyDownEvent,
    ColDef,
    FullWidthCellKeyDownEvent,
    GetRowIdFunc,
    ModuleRegistry,
    RowSelectionOptions,
    SELECTION_COLUMN_ID
} from 'ag-grid-community';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

type ExampleRowData = {
    id: string;
    event: string;
    severity: string;
    status: string;
    sourceIp: string;
    destinationIp: string;
    protocol: string;
    port: string;
    technique: string;
    host: string;
    detector: string;
    description: string;
};

@Component({
    selector: 'example-row-detail',
    imports: [KbqButtonModule, KbqDl, KbqDt, KbqDd],
    template: `
        <div class="example-row-detail-card">
            <kbq-dl>
                <kbq-dt>{{ t().description }}</kbq-dt>
                <kbq-dd>{{ data.description }}</kbq-dd>

                <kbq-dt>{{ t().affectedHost }}</kbq-dt>
                <kbq-dd>{{ data.host }}</kbq-dd>

                <kbq-dt>{{ t().detectedBy }}</kbq-dt>
                <kbq-dd>{{ data.detector }}</kbq-dd>
            </kbq-dl>

            <button kbq-button type="button" (click)="params.collapse()">{{ t().collapse }}</button>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-xs) var(--kbq-size-m) var(--kbq-size-l);
            /* The expanded part sits inside the row, which AG Grid renders with white-space: nowrap. */
            white-space: normal;
        }

        .example-row-detail-card {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-m);
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: var(--kbq-size-border-radius);
            background: var(--kbq-background-card);
        }

        kbq-dl {
            align-self: stretch;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleRowDetailComponent {
    protected readonly params = inject(KBQ_AG_GRID_ROW_DETAIL_PARAMS);
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly data = this.params.data as ExampleRowData;
}

/**
 * @title AG Grid with `KbqAgGridRowDetail` directive
 */
@Component({
    selector: 'ag-grid-row-detail-example',
    imports: [AgGridModule, KbqAgGridThemeModule, FormsModule, KbqToggleModule],
    template: `
        <div class="example-row-detail-options">
            <kbq-toggle [(ngModel)]="multipleExpand">{{ t().expandMultipleRows }}</kbq-toggle>
            <kbq-toggle [(ngModel)]="filled">{{ t().fillExpandedRows }}</kbq-toggle>
        </div>

        <ag-grid-angular
            #rowDetail="kbqAgGridRowDetail"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridRowDetail
            [alwaysMultiSort]="true"
            [kbqAgGridRowDetailComponent]="rowDetailComponent"
            [kbqAgGridRowDetailSingleExpand]="!multipleExpand()"
            [kbqAgGridRowDetailFilled]="filled()"
            [getRowId]="getRowId"
            [rowSelection]="rowSelection"
            [columnDefs]="columnDefs()"
            [rowData]="rowData()"
            (cellClicked)="onCellClicked($event, rowDetail)"
            (cellKeyDown)="onCellKeyDown($event, rowDetail)"
        />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-xl);
        }

        .example-row-detail-options {
            display: flex;
            gap: var(--kbq-size-xl);
        }

        ag-grid-angular {
            height: 400px;
            width: 100%;
        }
    `,
    providers: [kbqAgGridRowDetailLabelsProvider(KBQ_AG_GRID_ROW_DETAIL_LABELS_EN)],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridRowDetailExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly multipleExpand = signal(false);
    protected readonly filled = signal(false);

    protected readonly rowDetailComponent = ExampleRowDetailComponent;

    protected readonly getRowId: GetRowIdFunc<ExampleRowData> = ({ data }) => data.id;

    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        headerCheckbox: true,
        checkboxes: true
    };

    // Wider than the grid, so that scrolling it horizontally shows the expanded part staying in place.
    protected readonly columnDefs = computed<ColDef<ExampleRowData>[]>(() => [
        { field: 'event', headerName: this.t().event, width: 200 },
        { field: 'severity', headerName: this.t().severity, width: 110 },
        { field: 'status', headerName: this.t().status, width: 120 },
        { field: 'sourceIp', headerName: this.t().sourceIp, width: 140 },
        { field: 'destinationIp', headerName: this.t().destinationIp, width: 140 },
        { field: 'protocol', headerName: this.t().protocol, width: 110 },
        { field: 'port', headerName: this.t().port, width: 90 },
        { field: 'technique', headerName: this.t().mitreTechnique, width: 150 }
    ]);

    protected readonly rowData = computed<ExampleRowData[]>(() => this.t().incidents);

    /**
     * Clicking a cell expands and collapses its row. The expanded part is not a cell, so clicking
     * inside it never reaches this handler.
     */
    protected onCellClicked({ node, column }: CellClickedEvent, rowDetail: KbqAgGridRowDetail): void {
        // Leave the selection checkbox to the selection column itself.
        if (!node.id || column.getColId() === SELECTION_COLUMN_ID) return;

        rowDetail.toggle(node.id);
    }

    protected onCellKeyDown(
        { event, node }: CellKeyDownEvent | FullWidthCellKeyDownEvent,
        rowDetail: KbqAgGridRowDetail
    ): void {
        if (!(event instanceof KeyboardEvent) || event.key !== 'Enter' || !node.id) return;

        // The expand toggle is a button and handles Enter itself.
        if (event.target instanceof HTMLButtonElement) return;

        rowDetail.toggle(node.id);
    }
}

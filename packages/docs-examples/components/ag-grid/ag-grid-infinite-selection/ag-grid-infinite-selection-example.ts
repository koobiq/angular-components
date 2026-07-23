import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import {
    KbqAgGridInfiniteSelection,
    KbqAgGridInfiniteSelectionState,
    KbqAgGridSkeletonCellRenderer,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    GetRowIdFunc,
    ICellRendererParams,
    IDatasource,
    IGetRowsParams,
    ModuleRegistry,
    RowSelectionOptions,
    SelectionChangedEvent,
    SelectionColumnDef
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const ROW_DATA = Array.from({ length: 1000 }, (_, index) => ({
    id: 'ProjectName' + index,
    column0: 'ProjectName ' + index,
    column1: 'Text ' + index,
    column2: 'Text ' + index,
    column3: 'Text ' + index,
    column4: 'Text ' + index,
    column5: 'Text ' + index
}));

/**
 * Shape actually worth sending to a backend. `KbqAgGridInfiniteSelectionState.excludedIds` is only
 * meaningful while `selectAll` is `true` — outside select-all mode, the directive leaves individual
 * row selection entirely to AG Grid's own API, so `includedIds` has to be read from there instead.
 * Both fields are always present so the inapplicable one reads as an explicit `null`, not a missing key.
 */
type SelectionDto = {
    selectAll: boolean;
    includedIds: readonly string[] | null;
    excludedIds: readonly string[] | null;
};

/**
 * @title AG Grid with infinite selection
 */
@Component({
    selector: 'ag-grid-infinite-selection-example',
    imports: [AgGridModule, KbqAgGridThemeModule, JsonPipe],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridInfiniteSelection
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            [alwaysMultiSort]="true"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [rowSelection]="rowSelection"
            [selectionColumnDef]="selectionColumnDef"
            [kbqAgGridInfiniteSelectionDatasource]="datasource"
            [getRowId]="getRowId"
            [cacheBlockSize]="10"
            (kbqAgGridInfiniteSelectionStateChange)="onSelectAllChange($event)"
            (selectionChanged)="onSelectionChanged($event)"
        />
        <div class="ag-grid-infinite-selection-example-dto">
            <span>DTO sent to the backend:</span>
            <pre class="kbq-scrollbar"><code>{{ selectionDto() | json }}</code></pre>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            gap: var(--kbq-size-xl);
        }

        ag-grid-angular {
            flex-grow: 1;
            height: 300px;
        }

        .ag-grid-infinite-selection-example-dto {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
            width: 180px;
            font-size: var(--kbq-typography-text-compact-font-size);
            color: var(--kbq-foreground-contrast-secondary);
        }

        pre {
            margin: 0;
            max-height: 300px;
            overflow: scroll;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridInfiniteSelectionExample {
    protected readonly columnDefs: ColDef[] = [
        { field: 'column0', headerName: 'Project name', pinned: 'left', width: 130 },
        { field: 'column1', headerName: 'Text', width: 130 },
        { field: 'column2', headerName: 'Text', width: 130 },
        { field: 'column3', headerName: 'Text', width: 130 },
        { field: 'column4', headerName: 'Text', width: 130 },
        { field: 'column5', headerName: 'Text', width: 130 }
    ];
    protected readonly datasource: IDatasource = {
        rowCount: ROW_DATA.length,
        getRows: ({ startRow, endRow, successCallback }: IGetRowsParams) => {
            setTimeout(() => successCallback(ROW_DATA.slice(startRow, endRow), ROW_DATA.length), 500);
        }
    };
    protected readonly getRowId: GetRowIdFunc = ({ data }) => data.id;
    protected readonly defaultColDef: ColDef = {
        cellRendererSelector: (params: ICellRendererParams) =>
            params.data === undefined ? { component: KbqAgGridSkeletonCellRenderer } : undefined
    };
    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        isRowSelectable: ({ data }) => data !== undefined
    };
    protected readonly selectionColumnDef: SelectionColumnDef = {
        pinned: 'left'
    };
    private readonly infiniteSelection = viewChild.required(KbqAgGridInfiniteSelection);
    private readonly includedIds = signal<readonly string[]>([]);

    /**
     * The DTO this example would send to the backend for the current selection — combines the
     * directive's own `selectAll`/`excludedIds` state with `includedIds` tracked separately via
     * AG Grid's native selection, since the directive only maintains `excludedIds` while
     * `selectAll` is `true` (see `SelectionDto`).
     */
    protected readonly selectionDto = computed<SelectionDto>(() => {
        const state = this.infiniteSelection().state();

        return {
            selectAll: state.selectAll,
            includedIds: state.selectAll ? null : this.includedIds(),
            excludedIds: state.selectAll ? state.excludedIds : null
        };
    });

    protected onSelectAllChange(state: KbqAgGridInfiniteSelectionState): void {
        console.debug('onSelectAllChange: ', state);
    }

    /** Tracks individually selected row ids — only meaningful while `selectAll` is `false`. */
    protected onSelectionChanged({ api }: SelectionChangedEvent): void {
        this.includedIds.set(
            api
                .getSelectedNodes()
                .map((node) => node.id)
                .filter((id) => id !== undefined)
        );
    }
}

import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import {
    KbqAgGridInfiniteSelection,
    KbqAgGridInfiniteSelectionState,
    KbqAgGridSkeletonCellRenderer,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
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
import { ExampleTranslation, TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

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
            [columnDefs]="columnDefs()"
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
            <span>{{ t().dtoSentToBackend }}</span>
            <pre><code>{{ selectionDto() | json }}</code></pre>
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
export class AgGridInfiniteSelectionExample extends BaseLocalizedExample<ExampleTranslation> {
    protected readonly columnDefs = computed<ColDef[]>(() => [
        { field: 'column0', headerName: this.t().projectName, pinned: 'left', width: 130 },
        ...Array.from({ length: 5 }, (_, i) => ({
            field: 'column' + (i + 1),
            headerName: this.t().headerText,
            width: 130
        }))
    ]);
    // The row id is the selection identity: it stays the same in every locale.
    protected readonly datasource: IDatasource = {
        rowCount: 1000,
        getRows: ({ startRow, endRow, successCallback }: IGetRowsParams) => {
            setTimeout(
                () =>
                    successCallback(
                        Array.from({ length: endRow - startRow }, (_, i) => ({
                            id: 'ProjectName' + (startRow + i),
                            column0: 'Project name ' + (startRow + i),
                            ...Object.fromEntries(
                                Array.from({ length: 5 }, (_, c) => [
                                    'column' + (c + 1),
                                    'Text ' + (startRow + i)
                                ])
                            )
                        })),
                        1000
                    ),
                500
            );
        }
    };
    protected readonly getRowId: GetRowIdFunc = ({ data }) => data.id;
    protected readonly defaultColDef: ColDef = {
        cellRendererSelector: ({ data }: ICellRendererParams) =>
            data === undefined ? { component: KbqAgGridSkeletonCellRenderer } : undefined
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

    constructor() {
        super(TRANSLATIONS);
    }
}

import { ChangeDetectionStrategy, Component, computed, inject, model, signal, Signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    KBQ_AG_GRID_LOAD_ERROR_LABELS_EN,
    KBQ_AG_GRID_LOAD_ERROR_LABELS_RU,
    KbqAgGridLoadError,
    KbqAgGridSkeletonCellRenderer,
    KbqAgGridSkeletonSelectionCellComponent,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqLocaleService } from '@koobiq/components/core';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { AgGridModule, ICellRendererAngularComp } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    GridApi,
    GridReadyEvent,
    ICellRendererParams,
    IDatasource,
    IGetRowsParams,
    IsFullWidthRowParams,
    ModuleRegistry,
    RowSelectionOptions,
    RowStyle,
    SelectionColumnDef
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const PAGE_SIZE = 20;

/**
 * Rows the grid draws before anything has loaded. The cold start itself is the documentation site
 * loading this example's code, and the placeholder it shows meanwhile has the same three rows —
 * `kbqAgGridLoadingOverlay` here would only draw a second one over the first.
 */
const INITIAL_ROW_COUNT = 3;

/** The page whose first load fails, so the example always reaches the error row. */
const FAILING_PAGE_START_ROW = PAGE_SIZE * 3;

const ROW_DATA = Array.from({ length: 1000 }, (_, index) => ({
    column0: 'Text ' + index,
    column1: 'Text ' + index,
    column2: 'Text ' + index,
    column3: 'Text ' + index,
    column4: 'Text ' + index
}));

const PINNED_LEFT = ['ag-Grid-SelectionColumn', 'column0'];
const PINNED_RIGHT = ['column4'];

/** What the example hands its own full width renderer through `fullWidthCellRendererParams`. */
type LoadingTextParams = ICellRendererParams & {
    /**
     * A signal rather than a string, for the same reason the directive passes its own labels as one:
     * the language can change while the row is already on screen, and a plain value would be frozen
     * at the moment `agInit` ran.
     */
    label: Signal<string>;
};

/**
 * Plain text in place of the skeleton rows. A full width row rather than a cell: a cell clips what
 * sticks out of it, so the label could not start where the selection checkbox does.
 */
@Component({
    selector: 'ag-grid-load-error-example-loading-text',
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
export class AgGridLoadErrorExampleLoadingText implements ICellRendererAngularComp {
    private readonly params = signal<LoadingTextParams | undefined>(undefined);

    protected readonly label = computed(() => this.params()?.label() ?? '');

    agInit(params: LoadingTextParams): void {
        this.params.set(params);
    }

    refresh(params: LoadingTextParams): boolean {
        this.params.set(params);

        return true;
    }
}

/**
 * @title AG Grid with a load error row
 */
@Component({
    selector: 'ag-grid-load-error-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqToggleModule, FormsModule],
    template: `
        <div class="ag-grid-load-error-example-controls">
            <kbq-toggle [(ngModel)]="textInsteadOfSkeleton" (ngModelChange)="redrawRows()">
                Text instead of skeleton
            </kbq-toggle>
            <kbq-toggle [(ngModel)]="threeSkeletonRows" (ngModelChange)="restart()">
                3 skeleton rows (restarts)
            </kbq-toggle>
            <kbq-toggle [(ngModel)]="pinnedColumns" (ngModelChange)="applyPinned()">Pinned columns</kbq-toggle>
            <kbq-toggle [(ngModel)]="rowDividers">Row dividers</kbq-toggle>
            <kbq-toggle [(ngModel)]="tallRows">Taller rows</kbq-toggle>
            <span>network requests: {{ networkRequests() }}</span>
        </div>

        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridLoadError
            rowModelType="infinite"
            [class.ag-grid-load-error-example_dividers]="rowDividers()"
            [kbqAgGridLoadErrorLabels]="labels()"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [datasource]="datasource()"
            [rowSelection]="rowSelection"
            [selectionColumnDef]="selectionColumnDef"
            [isFullWidthRow]="isFullWidthRow"
            [fullWidthCellRenderer]="loadingTextRenderer"
            [fullWidthCellRendererParams]="loadingTextParams"
            [rowStyle]="rowStyle()"
            [rowHeight]="rowHeight()"
            [cacheBlockSize]="pageSize"
            [cacheOverflowSize]="skeletonRowCount()"
            [infiniteInitialRowCount]="initialRowCount"
            (gridReady)="onGridReady($event)"
        />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
        }

        .ag-grid-load-error-example-controls {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--kbq-size-l);
            color: var(--kbq-foreground-contrast-secondary);
        }

        ag-grid-angular {
            height: 300px;
            width: 100%;
        }

        /*
         * Part of the same example styling as rowStyle below, and the other half of squaring the
         * rows off: the last row sits against the bottom of the grid frame, whose own rounded
         * corners clip it. AG Grid reads the frame radius from this variable, so overriding it on
         * the grid element is enough — the rows themselves cannot reach the frame.
         */
        ag-grid-angular.ag-grid-load-error-example_dividers {
            --ag-wrapper-border-radius: var(--ag-border-radius) var(--ag-border-radius) 0 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridLoadErrorExample {
    readonly textInsteadOfSkeleton = model(false);
    readonly threeSkeletonRows = model(false);
    readonly pinnedColumns = model(true);
    readonly rowDividers = model(false);
    readonly tallRows = model(false);

    /** Shows that a retry only re-fetches the page that failed, even though the whole cache reloads. */
    readonly networkRequests = model(0);

    private readonly loadError = viewChild.required(KbqAgGridLoadError);

    private readonly localeService = inject(KbqLocaleService);

    /** Pages already fetched. A retry serves them from here, so only the failed page hits the network. */
    private readonly pageCache = new Map<number, (typeof ROW_DATA)[number][]>();

    private api?: GridApi;
    private failingPageAlreadyFailed = false;

    protected readonly pageSize = PAGE_SIZE;
    protected readonly initialRowCount = INITIAL_ROW_COUNT;
    protected readonly loadingTextRenderer = AgGridLoadErrorExampleLoadingText;

    protected readonly rowHeight = computed(() => (this.tallRows() ? 56 : 40));

    /**
     * Both languages come off `KbqLocaleService`: Russian for `ru-RU`, English for every other
     * locale. Switching the language of the documentation site re-renders a banner that is already
     * on screen, because the directive takes its labels through a signal input.
     */
    protected readonly labels = computed(() =>
        this.localeService.localeId() === 'ru-RU' ? KBQ_AG_GRID_LOAD_ERROR_LABELS_RU : KBQ_AG_GRID_LOAD_ERROR_LABELS_EN
    );

    /** The loading indicator is this example's own row, not the theme's, so it is localized here too. */
    protected readonly loadingLabel = computed(() =>
        this.localeService.localeId() === 'ru-RU' ? 'Загрузка...' : 'Loading...'
    );

    /**
     * Assigned once and never replaced. `kbqAgGridLoadError` needs this grid option for the banner
     * and folds whatever it finds here back into the renderer above, but AG Grid overwrites the
     * option wholesale on every new reference — a fresh object would take the banner's own params
     * with it. Hence the signal inside: the value changes, the object does not.
     */
    protected readonly loadingTextParams = { label: this.loadingLabel };

    /** How many rows trail the loaded data, each drawn as a skeleton while the next page is on its way. */
    protected readonly skeletonRowCount = computed(() => (this.threeSkeletonRows() ? 3 : 1));

    /**
     * In the text variant an unloaded row becomes a full width row, so that the label is not
     * indented by the selection column. `kbqAgGridLoadError` adds the failed row to this callback
     * itself and keeps the banner for it, so the two share the one full width renderer AG Grid has.
     *
     * One stable function that reads the toggle, not a `computed()` producing a new one: AG Grid
     * replaces the whole grid option every time the input emits a new reference, and that would
     * throw away the error row the directive composed into it.
     */
    protected readonly isFullWidthRow = ({ rowNode }: IsFullWidthRowParams): boolean =>
        this.textInsteadOfSkeleton() && rowNode.data === undefined;

    /**
     * Styling owned by this example, not by the theme: dividers are not a built-in variant of the
     * grid. The rounded corners the theme gives a row have to go with them — a radius leaves a gap
     * at both ends of every divider. The error row is a row like any other, so it picks both up.
     *
     * The empty strings matter: AG Grid writes `rowStyle` into the row's inline style and never
     * clears what it wrote, so dropping the option would leave the dividers on the rows already
     * rendered. An empty value removes the declaration and hands the row back to the stylesheet.
     */
    protected readonly rowStyle = computed<RowStyle>(() =>
        this.rowDividers()
            ? {
                  borderBottom: 'var(--kbq-size-border-width) solid var(--kbq-line-contrast-less)',
                  borderRadius: '0'
              }
            : { borderBottom: '', borderRadius: '' }
    );

    protected readonly columnDefs: ColDef[] = [
        { field: 'column0', headerName: 'Text', width: 130 },
        { field: 'column1', headerName: 'Text', width: 130 },
        { field: 'column2', headerName: 'Text', width: 130 },
        { field: 'column3', headerName: 'Text', width: 130 },
        { field: 'column4', headerName: 'Text', width: 130 }
    ];

    protected readonly selectionColumnDef: SelectionColumnDef = {
        pinned: 'left',
        cellRendererSelector: ({ data }: ICellRendererParams) =>
            data === undefined ? { component: KbqAgGridSkeletonSelectionCellComponent } : undefined
    };

    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        checkboxes: true,
        headerCheckbox: false,
        isRowSelectable: ({ data }) => data !== undefined
    };

    protected readonly defaultColDef: ColDef = {
        cellRendererSelector: ({ data }: ICellRendererParams) =>
            data === undefined ? { component: KbqAgGridSkeletonCellRenderer } : undefined
    };

    protected readonly datasource = signal<IDatasource>(this.createDatasource());

    protected onGridReady({ api }: GridReadyEvent): void {
        this.api = api;
        this.applyPinned();
    }

    /**
     * Replays the example from the first page, which is also the only way to change the number of
     * skeleton rows: AG Grid snapshots `cacheOverflowSize` when it builds the block cache, and a new
     * datasource is what makes it build a new one. Everything the example remembers goes with it,
     * the failure included, so the error row can be reached again.
     *
     * `clear()` first, because the grid is about to forget the rows the banner was standing on. Left
     * behind, it would survive a reload the directive never heard about — sorting and filtering are
     * the cases the directive handles on its own.
     */
    protected restart(): void {
        this.loadError().clear();

        this.pageCache.clear();
        this.failingPageAlreadyFailed = false;
        this.networkRequests.set(0);

        this.datasource.set(this.createDatasource());
    }

    /** `isFullWidthRow` is only evaluated while a row is being built, so the rows on screen need rebuilding. */
    protected redrawRows(): void {
        this.api?.redrawRows();
    }

    /** Pinning happens through the API: rewriting `selectionColumnDef` would drop what the theme put there. */
    protected applyPinned(): void {
        const pinned = this.pinnedColumns();

        this.api?.setColumnsPinned(PINNED_LEFT, pinned ? 'left' : null);
        this.api?.setColumnsPinned(PINNED_RIGHT, pinned ? 'right' : null);
    }

    private createDatasource(): IDatasource {
        return { getRows: (params: IGetRowsParams) => this.getRows(params) };
    }

    /**
     * `-1` for "there is more, I do not know how much" — the same answer whether the page came from
     * the network or from the cache, because caching a page teaches the client nothing about the
     * size of the dataset. Naming the total early would end the scrolling story: the grid would lay
     * every row out at once and stop appending the trailing rows the skeletons are drawn on.
     */
    private lastRowOf(endRow: number): number {
        return endRow >= ROW_DATA.length ? ROW_DATA.length : -1;
    }

    private getRows(params: IGetRowsParams): void {
        const cached = this.pageCache.get(params.startRow);

        if (cached) {
            params.successCallback(cached, this.lastRowOf(params.endRow));
            return;
        }

        this.networkRequests.update((count) => count + 1);

        setTimeout(() => {
            if (params.startRow === FAILING_PAGE_START_ROW && !this.failingPageAlreadyFailed) {
                this.failingPageAlreadyFailed = true;
                params.failCallback();
                this.loadError().fail(params.startRow);
                return;
            }

            const rows = ROW_DATA.slice(params.startRow, params.endRow);

            this.pageCache.set(params.startRow, rows);
            params.successCallback(rows, this.lastRowOf(params.endRow));
        }, 700);
    }
}

import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
    Signal,
    viewChild,
    WritableSignal
} from '@angular/core';
import {
    KBQ_AG_GRID_LOAD_ERROR_LABELS_EN,
    KBQ_AG_GRID_LOAD_ERROR_LABELS_RU,
    KBQ_AG_GRID_SETTINGS_MENU_LABELS_EN,
    KbqAgGridLoadError,
    KbqAgGridSettingsMenuItem,
    KbqAgGridSettingsMenuItems,
    kbqAgGridSettingsMenuLabelsProvider,
    KbqAgGridSkeletonCellRenderer,
    KbqAgGridSkeletonSelectionCellComponent,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqLocaleService } from '@koobiq/components/core';
import { AgGridModule, ICellRendererAngularComp } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    GridApi,
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
const FAILING_PAGE_START_ROW = PAGE_SIZE * 3;
const PINNED_LEFT = ['ag-Grid-SelectionColumn', 'column0'];
const PINNED_RIGHT = ['column4'];

const ROW_DATA = Array.from({ length: 1000 }, (_, index) => ({
    column0: 'Text ' + index,
    column1: 'Text ' + index,
    column2: 'Text ' + index,
    column3: 'Text ' + index,
    column4: 'Text ' + index
}));

type LoadingTextParams = ICellRendererParams & { label: Signal<string> };

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
    imports: [AgGridModule, KbqAgGridThemeModule],
    templateUrl: 'ag-grid-load-error-example.html',
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
        }

        ag-grid-angular {
            height: 300px;
            width: 100%;
        }
    `,
    providers: [kbqAgGridSettingsMenuLabelsProvider(KBQ_AG_GRID_SETTINGS_MENU_LABELS_EN)],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridLoadErrorExample {
    private readonly textInsteadOfSkeleton = signal(false);
    private readonly pinnedColumns = signal(true);
    private readonly rowDividers = signal(false);

    private readonly loadError = viewChild.required(KbqAgGridLoadError);
    private readonly localeService = inject(KbqLocaleService);
    private readonly pageCache = new Map<number, (typeof ROW_DATA)[number][]>();

    private failingPageAlreadyFailed = false;

    protected readonly pageSize = PAGE_SIZE;
    protected readonly initialRowCount = 7;
    protected readonly loadingTextRenderer = AgGridLoadErrorExampleLoadingText;

    protected readonly labels = computed(() =>
        this.localeService.localeId() === 'ru-RU' ? KBQ_AG_GRID_LOAD_ERROR_LABELS_RU : KBQ_AG_GRID_LOAD_ERROR_LABELS_EN
    );

    protected readonly loadingLabel = computed(() =>
        this.localeService.localeId() === 'ru-RU' ? 'Загрузка...' : 'Loading...'
    );

    protected readonly loadingTextParams = { label: this.loadingLabel };

    protected readonly rowStyle = computed<RowStyle>(() =>
        this.rowDividers()
            ? {
                  borderBottom: 'var(--kbq-size-border-width) solid var(--kbq-line-contrast-less)',
                  borderRadius: '0'
              }
            : { borderBottom: '', borderRadius: '' }
    );

    protected readonly settingsMenuItems: KbqAgGridSettingsMenuItems = [
        this.createSwitchItem('pinned-columns', 'Pinned columns', 'kbq-pin_16', this.pinnedColumns, (api, pinned) => {
            api.setColumnsPinned(PINNED_LEFT, pinned ? 'left' : null);
            api.setColumnsPinned(PINNED_RIGHT, pinned ? 'right' : null);
        }),
        this.createSwitchItem('row-dividers', 'Row dividers', 'kbq-bars-horizontal_16', this.rowDividers),
        this.createSwitchItem(
            'text-instead-of-skeleton',
            'Text instead of skeleton',
            'kbq-arrow-rotate-right_16',
            this.textInsteadOfSkeleton,
            (api) => api.redrawRows()
        )
    ];

    protected readonly isFullWidthRow = ({ rowNode }: IsFullWidthRowParams): boolean =>
        this.textInsteadOfSkeleton() && rowNode.data === undefined;

    protected readonly columnDefs: ColDef[] = [
        { field: 'column0', headerName: 'Text', width: 130, pinned: 'left' },
        { field: 'column1', headerName: 'Text', width: 130 },
        { field: 'column2', headerName: 'Text', width: 130 },
        { field: 'column3', headerName: 'Text', width: 130 },
        { field: 'column4', headerName: 'Text', width: 130, pinned: 'right' }
    ];

    protected readonly defaultColDef: ColDef = {
        cellRendererSelector: ({ data }: ICellRendererParams) =>
            data === undefined ? { component: KbqAgGridSkeletonCellRenderer } : undefined
    };

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

    protected readonly datasource: IDatasource = {
        getRows: (params: IGetRowsParams) => this.getRows(params)
    };

    private createSwitchItem(
        id: string,
        label: string,
        icon: string,
        state: WritableSignal<boolean>,
        onChange?: (api: GridApi, value: boolean) => void
    ): KbqAgGridSettingsMenuItem {
        return {
            id,
            label,
            icon,
            mode: 'single',
            value: computed(() => (state() ? 'On' : 'Off')),
            items: [true, false].map((value) => ({
                id: `${id}-${value ? 'on' : 'off'}`,
                label: value ? 'On' : 'Off',
                checked: computed(() => state() === value),
                keepOpen: true,
                action: (api: GridApi) => {
                    state.set(value);
                    onChange?.(api, value);
                }
            }))
        };
    }

    private getRows(params: IGetRowsParams): void {
        const { startRow, endRow, successCallback, failCallback } = params;
        const lastRow = endRow >= ROW_DATA.length ? ROW_DATA.length : -1;
        const cached = this.pageCache.get(startRow);

        if (cached) {
            successCallback(cached, lastRow);

            return;
        }

        setTimeout(() => {
            if (startRow === FAILING_PAGE_START_ROW && !this.failingPageAlreadyFailed) {
                this.failingPageAlreadyFailed = true;
                failCallback();
                this.loadError().fail(startRow);

                return;
            }

            const rows = ROW_DATA.slice(startRow, endRow);

            this.pageCache.set(startRow, rows);
            successCallback(rows, lastRow);
        }, 700);
    }
}

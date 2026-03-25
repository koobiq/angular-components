import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    output,
    Signal,
    signal,
    viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { KBQ_ACTIONS_PANEL_DATA, KbqActionsPanel, KbqActionsPanelRef } from '@koobiq/components/actions-panel';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqToastService } from '@koobiq/components/toast';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    FirstDataRenderedEvent,
    GridApi,
    ModuleRegistry,
    RowSelectionOptions,
    SelectionChangedEvent,
    SelectionColumnDef
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

type ExampleAction = {
    id: string;
    icon: string;
    divider?: boolean;
};

type ExampleTableItem = unknown;

@Component({
    selector: 'example-grid',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridSelectRowsByShiftClick
            disableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            [rowSelection]="rowSelection"
            [selectionColumnDef]="selectionColumnDef"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [rowData]="rowData"
            (firstDataRendered)="onFirstDataRendered($event)"
            (selectionChanged)="onSelectionChanged($event)"
        />
    `,
    styles: `
        :host {
            display: flex;
            height: 300px;
            width: 100%;
        }

        ag-grid-angular {
            height: 100%;
            width: 100%;
        }

        /** Adding extra space for actions panel */
        :host ::ng-deep .ag-body-viewport,
        :host ::ng-deep .ag-body-vertical-scroll {
            padding-bottom: 80px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleGrid {
    private api: GridApi<ExampleTableItem> | null = null;
    protected readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true,
        width: 140
    };
    protected readonly selectionColumnDef: SelectionColumnDef = {
        pinned: 'left'
    };
    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        headerCheckbox: true,
        checkboxes: true,
        hideDisabledCheckboxes: false
    };
    protected readonly columnDefs: ColDef[] = [
        {
            field: 'column0',
            headerName: 'Project name',
            pinned: true
        },
        {
            field: 'column1',
            headerName: 'Text'
        },
        {
            field: 'column2',
            headerName: 'Text'
        },
        {
            field: 'column3',
            headerName: 'Text'
        },
        {
            field: 'column4',
            headerName: 'Text'
        }
    ];
    protected readonly rowData = Array.from({ length: 33 }, (_, index) => ({
        column0: 'Project name ' + index,
        column1: 'Text ' + index,
        column2: 'Text ' + index,
        column3: 'Text ' + index,
        column4: 'Text ' + index
    }));
    readonly selectedItems = output<ExampleTableItem[]>();

    reset(): void {
        this.api?.deselectAll();
    }

    protected onFirstDataRendered({ api }: FirstDataRenderedEvent): void {
        api.setFocusedCell(0, 'column0');
        api.forEachNode((node) => {
            if (node.rowIndex === 3 || node.rowIndex === 4) {
                node.setSelected(true);
            }
        });
        api.setColumnWidths([{ key: 'ag-Grid-SelectionColumn', newWidth: 36 }]);

        this.api = api;
    }

    protected onSelectionChanged({ api }: SelectionChangedEvent<ExampleTableItem>): void {
        this.selectedItems.emit(api.getSelectedRows());
    }
}

@Component({
    selector: 'example-actions-panel',
    imports: [
        KbqOverflowItemsModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDropdownModule,
        KbqDividerModule
    ],
    template: `
        <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems>
            <div order="99" [kbqOverflowItem]="action.Counter">
                <div class="example-counter">Selected: {{ data().length }}</div>
                <kbq-divider class="example-divider-vertical" [vertical]="true" />
            </div>

            @for (action of actions; track action.id) {
                <div [kbqOverflowItem]="action.id">
                    @if (action.divider) {
                        <kbq-divider class="example-divider-vertical" [vertical]="true" />
                    }
                    <button
                        color="contrast"
                        kbq-button
                        [class.layout-margin-left-xxs]="!$first"
                        (click)="onAction(action)"
                    >
                        <i kbq-icon [class]="action.icon"></i>
                        {{ action.id }}
                    </button>
                </div>
            }

            @let hiddenItemIDs = kbqOverflowItems.hiddenItemIDs();
            <!-- ignores when only action.Counter is hidden -->
            @if (hiddenItemIDs.size > 1) {
                <button kbqOverflowItemsResult color="contrast" kbq-button [kbqDropdownTriggerFor]="dropdown">
                    <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                </button>
            }

            <kbq-dropdown #dropdown="kbqDropdown">
                <div class="example-counter-dropdown">Selected: {{ data().length }}</div>
                <kbq-divider />

                @for (action of actions; track action.id) {
                    @if (hiddenItemIDs.has(action.id)) {
                        @if (action.divider && hiddenItemIDs.has(actions[$index - 1].id)) {
                            <kbq-divider />
                        }
                        <button kbq-dropdown-item (click)="onAction(action)">
                            <i kbq-icon [class]="action.icon"></i>
                            {{ action.id }}
                        </button>
                    }
                }
            </kbq-dropdown>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            overflow: hidden;
            flex-grow: 1;
        }

        .example-counter {
            margin: 0 var(--kbq-size-m);
            width: 75px;
        }

        .example-counter,
        .example-counter-dropdown {
            user-select: none;
            white-space: nowrap;
        }

        .example-counter-dropdown {
            font-weight: var(--kbq-typography-text-normal-strong-font-weight);
            margin: var(--kbq-size-s) var(--kbq-size-m);
        }

        .kbq-overflow-item {
            display: flex;
            align-items: center;
        }

        .example-divider-vertical {
            background-color: var(--kbq-actions-panel-vertical-divider-background-color);
            height: var(--kbq-actions-panel-vertical-divider-height) !important;
            margin: var(--kbq-actions-panel-vertical-divider-margin);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleActionsPanel {
    protected readonly actions: ExampleAction[] = [
        { id: 'Responsible', icon: 'kbq-user_16' },
        { id: 'Link to incident', icon: 'kbq-link_16' },
        { id: 'Remove', icon: 'kbq-trash_16', divider: true }
    ];
    protected readonly action = { Counter: 'counter' };
    protected readonly data = inject<Signal<ExampleTableItem[]>>(KBQ_ACTIONS_PANEL_DATA);
    protected readonly actionsPanelRef = inject(KbqActionsPanelRef);
    private readonly toast = inject(KbqToastService);

    protected onAction(action: ExampleAction): void {
        this.toast.show({ title: `Action initiated ${action.id}` });
    }
}

/**
 * @title Actions panel overview
 */
@Component({
    selector: 'actions-panel-overview-example',
    imports: [ExampleGrid],
    template: `
        <example-grid (selectedItems)="toggleActionsPanel($event)" />
    `,
    styles: `
        :host {
            display: flex;
            overflow: hidden;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [KbqActionsPanel]
})
export class ActionsPanelOverviewExample {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly container = viewChild.required(ExampleGrid, { read: ElementRef });
    private readonly grid = viewChild.required(ExampleGrid);
    private actionsPanelRef: KbqActionsPanelRef<ExampleActionsPanel> | null;
    private readonly data = signal<ExampleTableItem[]>([]);
    private readonly destroyRef = inject(DestroyRef);

    protected toggleActionsPanel(selectedItems: ExampleTableItem[]): void {
        if (selectedItems.length === 0) return this.actionsPanel.close();

        this.data.set(selectedItems);

        if (this.actionsPanelRef) return;

        this.actionsPanelRef = this.actionsPanel.open(ExampleActionsPanel, {
            data: this.data,
            overlayContainer: this.container()
        });

        this.actionsPanelRef.afterOpened.subscribe(() => {
            console.log('ActionsPanel opened');
        });

        this.actionsPanelRef.afterClosed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
            console.log('ActionsPanel closed by action:', result);

            this.actionsPanelRef = null;
            this.grid().reset();
        });
    }
}

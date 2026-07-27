import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    input,
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

/** Actions panel height with margins — kept in sync with the `padding-bottom: 72px` in ExampleGrid's styles. */
const ACTIONS_PANEL_HEIGHT = 72;

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
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            [alwaysMultiSort]="true"
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

        /*
         * Reserve space for the actions panel only while it's open, animating in sync with its
         * own slide transition instead of a permanent gap that's still there once the panel is
         * closed. Duration/curve values below are copied from KBQ_ACTIONS_PANEL_CONTAINER_ANIMATION
         * (packages/components/actions-panel/actions-panel-container.ts) — not importable here since
         * that trigger is defined for the panel's own 'state' animation, not exposed as CSS. Keep in
         * sync if that trigger's durations/curve ever change.
         */
        :host ::ng-deep .ag-body-viewport {
            padding-bottom: 0;
            transition: padding-bottom 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        :host(.example-grid_actions-panel-opened) ::ng-deep .ag-body-viewport {
            /* see ACTIONS_PANEL_HEIGHT */
            padding-bottom: 72px;
            transition: padding-bottom 125ms cubic-bezier(0.4, 0, 0.2, 1);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class.example-grid_actions-panel-opened]': 'panelOpened()'
    }
})
export class ExampleGrid {
    readonly panelOpened = input(false);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
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
        { field: 'column0', headerName: 'Project name', pinned: true },
        { field: 'column1', headerName: 'Text' },
        { field: 'column2', headerName: 'Text' },
        { field: 'column3', headerName: 'Text' },
        { field: 'column4', headerName: 'Text' }
    ];
    protected readonly rowData = Array.from({ length: 33 }, (_, index) => ({
        column0: 'Project name ' + index,
        column1: 'Text ' + index,
        column2: 'Text ' + index,
        column3: 'Text ' + index,
        column4: 'Text ' + index
    }));
    readonly selectedItems = output<ExampleTableItem[]>();

    constructor() {
        effect(() => {
            if (!this.panelOpened()) return;
            if (this.getScrollBottomOffset() > ACTIONS_PANEL_HEIGHT) return;

            // The grid was scrolled (near) to its bottom before the panel reserved space for
            // itself — without this, the panel would overlap the last rows instead of the
            // padding revealed by the `.example-grid_actions-panel-opened` styles. Deferred
            // until that padding-bottom transition finishes, since scrollHeight only grows to
            // its full value once the animation settles.
            this.getBodyViewport()?.addEventListener('transitionend', () => this.scrollToBottom(), {
                once: true
            });
        });
    }

    reset(): void {
        this.api?.deselectAll();
    }

    /** Distance, in px, between the current scroll position and the bottom of the grid's content. */
    private getScrollBottomOffset(): number {
        const viewport = this.getBodyViewport();

        return viewport ? viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight : 0;
    }

    /** Scrolls the grid all the way down, revealing the padding reserved for the actions panel. */
    private scrollToBottom(): void {
        const viewport = this.getBodyViewport();

        viewport?.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }

    private getBodyViewport(): HTMLElement | null {
        return this.elementRef.nativeElement.querySelector('.ag-body-viewport');
    }

    protected onFirstDataRendered({ api }: FirstDataRenderedEvent): void {
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
 * @title Ag-grid and actions-panel example
 */
@Component({
    selector: 'ag-grid-and-actions-panel-example',
    imports: [ExampleGrid],
    template: `
        <example-grid [panelOpened]="panelOpened()" (selectedItems)="toggleActionsPanel($event)" />
    `,
    styles: `
        :host {
            display: flex;
            overflow: hidden;
        }
    `,
    providers: [KbqActionsPanel],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridAndActionsPanelExample {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly container = viewChild.required(ExampleGrid, { read: ElementRef });
    private readonly grid = viewChild.required(ExampleGrid);
    private actionsPanelRef!: KbqActionsPanelRef<ExampleActionsPanel> | null;
    private readonly data = signal<ExampleTableItem[]>([]);
    private readonly destroyRef = inject(DestroyRef);
    protected readonly panelOpened = signal(false);

    protected toggleActionsPanel(selectedItems: ExampleTableItem[]): void {
        if (selectedItems.length === 0) return this.actionsPanel.close();

        this.data.set(selectedItems);

        if (this.actionsPanelRef) return;

        this.actionsPanelRef = this.actionsPanel.open(ExampleActionsPanel, {
            data: this.data,
            overlayContainer: this.container()
        });

        this.actionsPanelRef.beforeOpened.subscribe(() => {
            this.panelOpened.set(true);
        });

        // Fires as soon as close() is called, before the exit animation plays — so the grid's
        // padding starts collapsing in sync with the panel's own slide-down instead of ~150ms late.
        this.actionsPanelRef.beforeClosed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.panelOpened.set(false);
        });

        this.actionsPanelRef.afterClosed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
            console.log('ActionsPanel closed by action:', result);

            this.actionsPanelRef = null;
            this.grid().reset();
        });
    }
}

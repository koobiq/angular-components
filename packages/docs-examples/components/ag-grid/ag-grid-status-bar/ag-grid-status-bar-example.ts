import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { KBQ_AG_GRID_STATUS_BAR_PARAMS, KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    FirstDataRenderedEvent,
    ModuleRegistry,
    RowSelectionOptions
} from 'ag-grid-community';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
    selector: 'example-ag-grid-status-bar',
    template: `
        <div>{{ t().totalRows }} {{ totalRows() }}</div>
        <div>{{ t().selected }} {{ selectedRows() }}</div>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-l);
            height: var(--kbq-size-4xl);
            padding: 0 var(--kbq-size-l);
            border-top: var(--kbq-size-border-width) solid var(--kbq-line-contrast-less);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleAgGridStatusBarComponent {
    protected readonly t = injectTranslation(TRANSLATIONS);

    private readonly params = inject(KBQ_AG_GRID_STATUS_BAR_PARAMS);
    private readonly destroyRef = inject(DestroyRef);

    protected readonly totalRows = signal(0);
    protected readonly selectedRows = signal(0);

    constructor() {
        const { api } = this.params;

        const updateTotal = (): void => this.totalRows.set(api.getDisplayedRowCount());
        const updateSelected = (): void => this.selectedRows.set(api.getSelectedNodes().length);

        updateTotal();
        updateSelected();

        api.addEventListener('modelUpdated', updateTotal);
        api.addEventListener('selectionChanged', updateSelected);

        this.destroyRef.onDestroy(() => {
            api.removeEventListener('modelUpdated', updateTotal);
            api.removeEventListener('selectionChanged', updateSelected);
        });
    }
}

/**
 * @title AG Grid with `KbqAgGridStatusBar` directive
 */
@Component({
    selector: 'ag-grid-status-bar-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            pagination
            [alwaysMultiSort]="true"
            [kbqAgGridStatusBar]="statusBarComponent"
            [rowSelection]="rowSelection"
            [style.height.px]="300"
            [columnDefs]="columnDefs()"
            [defaultColDef]="defaultColDef"
            [rowData]="rowData"
            (firstDataRendered)="onFirstDataRendered($event)"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridStatusBarExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly statusBarComponent = ExampleAgGridStatusBarComponent;

    protected readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true,
        width: 140
    };

    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        headerCheckbox: true,
        checkboxes: true,
        hideDisabledCheckboxes: false
    };

    protected readonly columnDefs = computed<ColDef[]>(() => [
        {
            field: 'column0',
            headerName: this.t().projectName,
            width: 180
        },
        ...Array.from({ length: 9 }, (_, i) => ({
            field: 'column' + (i + 1),
            headerName: this.t().headerText
        }))
    ]);

    protected readonly rowData = Array.from({ length: 100 }, (_, index) => ({
        column0: 'Project name ' + index,
        ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => ['column' + (i + 1), 'Text ' + index]))
    }));

    protected onFirstDataRendered({ api }: FirstDataRenderedEvent): void {
        api.forEachNode((node) => {
            if (node.rowIndex === 3 || node.rowIndex === 4) {
                node.setSelected(true);
            }
        });
    }
}

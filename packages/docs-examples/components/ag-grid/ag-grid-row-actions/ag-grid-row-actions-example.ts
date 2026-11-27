import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    type ColDef,
    type FirstDataRenderedEvent,
    ModuleRegistry,
    type RowSelectionOptions
} from 'ag-grid-community';
import { KBQ_AG_GRID_ROW_ACTIONS_PARAMS, KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToastService } from '@koobiq/components/toast';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { exampleIncidentColumns } from '../incident-columns';
import { exampleGetIncidents } from '../security-incidents';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
    selector: 'example-row-actions',
    imports: [KbqIconModule],
    template: `
        <i kbq-icon-button="kbq-square-multiple-o_16" color="contrast-fade" (click)="copy()"></i>
        <i kbq-icon-button="kbq-box-archive_16" color="contrast-fade" (click)="delete()"></i>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: var(--kbq-size-s);
            height: 100%;
            width: 200px;
            padding: 0 var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleRowActionsComponent {
    private readonly clipboard = inject(Clipboard);
    private readonly toast = inject(KbqToastService);
    private readonly params = inject(KBQ_AG_GRID_ROW_ACTIONS_PARAMS);

    protected readonly t = injectTranslation(TRANSLATIONS);

    protected copy(): void {
        this.clipboard.copy(JSON.stringify(this.params.data));
        this.toast.show({ title: this.t().rowCopied(this.params.rowIndex ?? 0) });
    }

    protected delete(): void {
        this.params.api.applyTransaction({ remove: [this.params.data] });
        this.toast.show({ title: this.t().rowArchived(this.params.rowIndex ?? 0) });
    }
}

/**
 * @title AG Grid with `KbqAgGridRowActions` directive
 */
@Component({
    selector: 'ag-grid-row-actions-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            [alwaysMultiSort]="true"
            [kbqAgGridRowActions]="rowActionsComponent"
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
export class AgGridRowActionsExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly rowActionsComponent = ExampleRowActionsComponent;
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
    protected readonly columnDefs = computed(() => exampleIncidentColumns(this.t().headers));
    protected readonly rowData = exampleGetIncidents();

    protected onFirstDataRendered({ api }: FirstDataRenderedEvent): void {
        api.forEachNode((node) => {
            if (node.rowIndex === 3 || node.rowIndex === 4) {
                node.setSelected(true);
            }
        });
    }
}

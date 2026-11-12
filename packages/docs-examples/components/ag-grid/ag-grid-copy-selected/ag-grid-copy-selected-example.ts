import { ChangeDetectionStrategy, Component, computed, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    KbqAgGridCopyEvent,
    KbqAgGridCopyFormatter,
    kbqAgGridCopyFormatterCsv,
    kbqAgGridCopyFormatterJson,
    kbqAgGridCopyFormatterTsv,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqToastService } from '@koobiq/components/toast';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    FirstDataRenderedEvent,
    ModuleRegistry,
    RowSelectionOptions
} from 'ag-grid-community';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

const customCopyFormatterWithHeaderRow: KbqAgGridCopyFormatter = (api) => {
    const columns = api.getAllDisplayedColumns().filter((col) => col.getColId() !== 'ag-Grid-SelectionColumn');
    const headerRow = columns.map((col) => col.getColDef().headerName ?? col.getColId()).join('\t');

    return `${headerRow}\n${kbqAgGridCopyFormatterTsv(api)}`;
};

/**
 * @title AG Grid with `KbqAgGridCopyByCtrlC` directive
 */
@Component({
    selector: 'ag-grid-copy-selected-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqSelectModule, FormsModule],
    template: `
        <kbq-form-field>
            <kbq-select [(ngModel)]="copyFormat">
                @for (option of copyFormatOptions; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            kbqAgGridCopyByCtrlC
            [alwaysMultiSort]="true"
            [kbqAgGridCopyFormatter]="copyFormatter()"
            [rowSelection]="rowSelection"
            [style.height.px]="300"
            [columnDefs]="columnDefs()"
            [defaultColDef]="defaultColDef"
            [rowData]="rowData()"
            (kbqAgGridCopyDone)="onCopyDone($event)"
            (firstDataRendered)="onFirstDataRendered($event)"
        />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
        }

        .kbq-form-field {
            width: 200px;
            align-self: center;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridCopySelectedExample extends BaseLocalizedExample<ExampleTranslation> {
    private readonly toast = inject(KbqToastService);

    protected readonly copyFormatOptions = ['TSV', 'CSV', 'JSON', 'Custom'] as const;
    protected readonly copyFormat = model<(typeof this.copyFormatOptions)[number]>('TSV');
    protected readonly copyFormatter = computed<KbqAgGridCopyFormatter | undefined>(() => {
        switch (this.copyFormat()) {
            case 'Custom': {
                return customCopyFormatterWithHeaderRow;
            }
            case 'CSV': {
                return kbqAgGridCopyFormatterCsv;
            }
            case 'JSON': {
                return kbqAgGridCopyFormatterJson;
            }
            case 'TSV':
            default: {
                return kbqAgGridCopyFormatterTsv;
            }
        }
    });

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

    protected readonly rowData = computed(() =>
        Array.from({ length: 100 }, (_, index) => ({
            column0: 'Project name ' + index,
            ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => ['column' + (i + 1), 'Text ' + index]))
        }))
    );

    protected onFirstDataRendered({ api }: FirstDataRenderedEvent): void {
        api.forEachNode((node) => {
            if (node.rowIndex === 3 || node.rowIndex === 4) {
                node.setSelected(true);
            }
        });
    }

    protected onCopyDone({ success }: KbqAgGridCopyEvent): void {
        if (success) {
            this.toast.show({
                title: this.t().dataCopied,
                caption: this.t().dataCopiedCaption(this.copyFormat())
            });
        }
    }

    constructor() {
        super(TRANSLATIONS);
    }
}

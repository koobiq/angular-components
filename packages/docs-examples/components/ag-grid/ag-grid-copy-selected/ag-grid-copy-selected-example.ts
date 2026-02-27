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
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqToastService } from '@koobiq/components/toast';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    FirstDataRenderedEvent,
    ModuleRegistry,
    RowSelectionOptions
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

type ExampleRowData = {
    column0: string;
    column1: string;
    column2: string;
    column3: string;
    column4: string;
    column5: string;
    column6: string;
    column7: string;
    column8: string;
    column9: string;
};

/**
 * @title AG Grid with `KbqAgGridCopyByCtrlC` directive
 */
@Component({
    selector: 'ag-grid-copy-selected-example',
    imports: [AgGridModule, KbqAgGridThemeModule, KbqSelectModule, KbqFormFieldModule, FormsModule],
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
            disableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectAllRowsByCtrlA
            kbqAgGridSelectRowsByCtrlClick
            kbqAgGridCopyByCtrlC
            [kbqAgGridCopyFormatter]="copyFormatter()"
            [rowSelection]="rowSelection"
            [style.height.px]="300"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [rowData]="rowData"
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
export class AgGridCopySelectedExample {
    private readonly toast = inject(KbqToastService);
    protected readonly copyFormatOptions = ['TSV', 'CSV', 'JSON', 'Custom'] as const;
    protected readonly copyFormat = model<(typeof this.copyFormatOptions)[number]>('TSV');
    protected readonly copyFormatter = computed<KbqAgGridCopyFormatter | undefined>(() => {
        switch (this.copyFormat()) {
            case 'Custom': {
                return ({ selectedNodes }) => `Custom copy formatter output. Selected nodes: ${selectedNodes.length}.`;
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

    protected readonly columnDefs: ColDef[] = [
        {
            field: 'column0',
            headerName: 'Project name',
            width: 180
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
        },
        {
            field: 'column5',
            headerName: 'Text'
        },
        {
            field: 'column6',
            headerName: 'Text'
        },
        {
            field: 'column7',
            headerName: 'Text'
        },
        {
            field: 'column8',
            headerName: 'Text'
        },
        {
            field: 'column9',
            headerName: 'Text'
        }
    ];

    protected readonly rowData: ExampleRowData[] = Array.from({ length: 100 }, (_, index) => ({
        column0: 'Project name ' + index,
        column1: 'Text ' + index,
        column2: 'Text ' + index,
        column3: 'Text ' + index,
        column4: 'Text ' + index,
        column5: 'Text ' + index,
        column6: 'Text ' + index,
        column7: 'Text ' + index,
        column8: 'Text ' + index,
        column9: 'Text ' + index
    }));

    protected onFirstDataRendered({ api }: FirstDataRenderedEvent): void {
        api.forEachNode((node) => {
            if (node.rowIndex === 3 || node.rowIndex === 4) {
                node.setSelected(true);
            }
        });

        api.setColumnWidths([{ key: 'ag-Grid-SelectionColumn', newWidth: 36 }]);
    }

    protected onCopyDone({ success }: KbqAgGridCopyEvent): void {
        success &&
            this.toast.show({
                title: 'Data copied',
                caption: `Selected nodes have been copied to clipboard. Format: ${this.copyFormat()}`
            });
    }
}

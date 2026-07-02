import { ChangeDetectionStrategy, Component, effect, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { kbqAgGridLoadingOverlayConfigProvider, KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with loading overlay
 */
@Component({
    selector: 'ag-grid-loading-overlay-example',
    imports: [AgGridModule, KbqAgGridThemeModule, FormsModule, KbqCheckboxModule],
    template: `
        <kbq-checkbox [(ngModel)]="loading">Show loading overlay</kbq-checkbox>

        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            [kbqAgGridLoadingOverlay]="loading()"
            [rowData]="rowData"
            [columnDefs]="columnDefs"
        />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-xl);
        }

        ag-grid-angular {
            height: 300px;
            width: 100%;
        }
    `,
    providers: [kbqAgGridLoadingOverlayConfigProvider({ rows: 6, cols: 4 })],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridLoadingOverlayExample {
    readonly loading = model(true);
    readonly columnDefs: ColDef[] = [
        { field: 'column0', headerName: 'Text' },
        { field: 'column1', headerName: 'Text' },
        { field: 'column2', headerName: 'Text' },
        { field: 'column3', headerName: 'Text' },
        { field: 'column4', headerName: 'Text' },
        { field: 'column5', headerName: 'Text' }
    ];
    readonly rowData = Array.from({ length: 50 }, (_, index) => ({
        column0: 'Text ' + index,
        column1: 'Text ' + index,
        column2: 'Text ' + index,
        column3: 'Text ' + index,
        column4: 'Text ' + index,
        column5: 'Text ' + index
    }));

    constructor() {
        effect(() => {
            console.log('this.loading', this.loading());
        });
    }
}

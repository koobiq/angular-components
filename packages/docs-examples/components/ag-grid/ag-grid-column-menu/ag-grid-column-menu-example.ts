import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    KBQ_AG_GRID_COLUMN_MENU_LABELS_EN,
    kbqAgGridColumnMenuLabelsProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * @title AG Grid with column menu
 */
@Component({
    selector: 'ag-grid-column-menu-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            kbqAgGridColumnMenu
            [rowData]="rowData"
            [columnDefs]="columnDefs"
            [alwaysMultiSort]="true"
        />
    `,
    styles: `
        ag-grid-angular {
            height: 400px;
            max-width: 100%;
        }
    `,
    providers: [kbqAgGridColumnMenuLabelsProvider(KBQ_AG_GRID_COLUMN_MENU_LABELS_EN)],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridColumnMenuExample {
    readonly columnDefs: ColDef[] = [
        // Pinned and always visible — can't be hidden.
        { field: 'incidentId', headerName: 'Incident ID', lockVisible: true, pinned: 'left', width: 110 },
        // Shown by default. Severity and status are also locked from hiding.
        { field: 'severity', headerName: 'Severity', lockVisible: true, width: 100 },
        { field: 'status', headerName: 'Status', lockVisible: true, width: 140 },
        { field: 'attackType', headerName: 'Attack type', width: 170 },
        { field: 'sourceIp', headerName: 'Source IP', width: 128 },
        // Hidden by default, but available to show from the column menu.
        { field: 'affectedHost', headerName: 'Affected host', hide: true, width: 170 },
        { field: 'destinationIp', headerName: 'Destination IP', hide: true, width: 128 },
        { field: 'assignedAnalyst', headerName: 'Assigned analyst', hide: true, width: 170 },
        { field: 'mitreTechnique', headerName: 'MITRE technique', hide: true, width: 130 },
        { field: 'mitreTechniqueName', headerName: 'MITRE technique name', hide: true, width: 260 },
        { field: 'responseAction', headerName: 'Response action', hide: true, width: 180 },
        { field: 'sourcePort', headerName: 'Source port', hide: true, width: 130 },
        { field: 'destinationPort', headerName: 'Destination port', hide: true, width: 150 },
        { field: 'protocol', headerName: 'Protocol', hide: true, width: 120 },
        { field: 'detectionSource', headerName: 'Detection source', hide: true, width: 170 },
        { field: 'confidenceScore', headerName: 'Confidence score', hide: true, width: 160 },
        { field: 'assetOwner', headerName: 'Asset owner', hide: true, width: 150 },
        { field: 'businessUnit', headerName: 'Business unit', hide: true, width: 150 },
        { field: 'threatActor', headerName: 'Threat actor', hide: true, width: 150 },
        { field: 'malwareFamily', headerName: 'Malware family', hide: true, width: 160 },
        { field: 'remediationStatus', headerName: 'Remediation status', hide: true, width: 180 }
    ];

    readonly rowData = Array.from({ length: 30 }, (_, index) =>
        Object.fromEntries(this.columnDefs.map(({ field }) => [field as string, 'Text ' + index]))
    );
}

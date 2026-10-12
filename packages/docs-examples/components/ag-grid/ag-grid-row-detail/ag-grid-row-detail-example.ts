import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    KBQ_AG_GRID_ROW_DETAIL_LABELS_EN,
    KBQ_AG_GRID_ROW_DETAIL_PARAMS,
    KbqAgGridRowDetail,
    kbqAgGridRowDetailLabelsProvider,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    CellClickedEvent,
    CellKeyDownEvent,
    ColDef,
    FullWidthCellKeyDownEvent,
    GetRowIdFunc,
    ModuleRegistry,
    RowSelectionOptions,
    SELECTION_COLUMN_ID
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

type ExampleRowData = {
    id: string;
    event: string;
    severity: string;
    status: string;
    sourceIp: string;
    destinationIp: string;
    protocol: string;
    port: string;
    technique: string;
    host: string;
    detector: string;
    description: string;
};

@Component({
    selector: 'example-row-detail',
    imports: [KbqButtonModule, KbqDlModule],
    template: `
        <div class="example-row-detail-card">
            <kbq-dl>
                <kbq-dt>Description</kbq-dt>
                <kbq-dd>{{ data.description }}</kbq-dd>

                <kbq-dt>Affected host</kbq-dt>
                <kbq-dd>{{ data.host }}</kbq-dd>

                <kbq-dt>Detected by</kbq-dt>
                <kbq-dd>{{ data.detector }}</kbq-dd>
            </kbq-dl>

            <button kbq-button type="button" (click)="params.collapse()">Collapse</button>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-xs) var(--kbq-size-m) var(--kbq-size-l);
            /* The expanded part sits inside the row, which AG Grid renders with white-space: nowrap. */
            white-space: normal;
        }

        .example-row-detail-card {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-m);
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: var(--kbq-size-border-radius);
            background: var(--kbq-background-card);
        }

        kbq-dl {
            align-self: stretch;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleRowDetailComponent {
    protected readonly params = inject(KBQ_AG_GRID_ROW_DETAIL_PARAMS);
    protected readonly data = this.params.data as ExampleRowData;
}

/**
 * @title AG Grid with `KbqAgGridRowDetail` directive
 */
@Component({
    selector: 'ag-grid-row-detail-example',
    imports: [AgGridModule, KbqAgGridThemeModule, FormsModule, KbqToggleModule],
    template: `
        <div class="example-row-detail-options">
            <kbq-toggle [(ngModel)]="multipleExpand">Expand multiple rows</kbq-toggle>
            <kbq-toggle [(ngModel)]="filled">Fill expanded rows</kbq-toggle>
        </div>

        <ag-grid-angular
            #rowDetail="kbqAgGridRowDetail"
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridRowDetail
            [alwaysMultiSort]="true"
            [kbqAgGridRowDetailComponent]="rowDetailComponent"
            [kbqAgGridRowDetailSingleExpand]="!multipleExpand()"
            [kbqAgGridRowDetailFilled]="filled()"
            [getRowId]="getRowId"
            [rowSelection]="rowSelection"
            [columnDefs]="columnDefs"
            [rowData]="rowData"
            (cellClicked)="onCellClicked($event, rowDetail)"
            (cellKeyDown)="onCellKeyDown($event, rowDetail)"
        />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-xl);
        }

        .example-row-detail-options {
            display: flex;
            gap: var(--kbq-size-xl);
        }

        ag-grid-angular {
            height: 400px;
            width: 100%;
        }
    `,
    providers: [kbqAgGridRowDetailLabelsProvider(KBQ_AG_GRID_ROW_DETAIL_LABELS_EN)],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridRowDetailExample {
    protected readonly multipleExpand = signal(false);
    protected readonly filled = signal(false);

    protected readonly rowDetailComponent = ExampleRowDetailComponent;

    protected readonly getRowId: GetRowIdFunc<ExampleRowData> = ({ data }) => data.id;

    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        headerCheckbox: true,
        checkboxes: true
    };

    // Wider than the grid, so that scrolling it horizontally shows the expanded part staying in place.
    protected readonly columnDefs: ColDef<ExampleRowData>[] = [
        { field: 'event', headerName: 'Event', width: 200 },
        { field: 'severity', headerName: 'Severity', width: 110 },
        { field: 'status', headerName: 'Status', width: 120 },
        { field: 'sourceIp', headerName: 'Source IP', width: 140 },
        { field: 'destinationIp', headerName: 'Destination IP', width: 140 },
        { field: 'protocol', headerName: 'Protocol', width: 110 },
        { field: 'port', headerName: 'Port', width: 90 },
        { field: 'technique', headerName: 'MITRE technique', width: 150 }
    ];

    protected readonly rowData: ExampleRowData[] = [
        {
            id: 'INC-1001',
            event: 'Brute force',
            severity: 'High',
            status: 'In progress',
            sourceIp: '203.0.113.24',
            destinationIp: '10.0.1.10',
            protocol: 'SSH',
            port: '22',
            technique: 'T1110',
            host: 'srv-01',
            detector: 'IDS',
            description: '15 failed SSH logins within two minutes, followed by a successful one.'
        },
        {
            id: 'INC-1002',
            event: 'Port scan',
            severity: 'Low',
            status: 'Resolved',
            sourceIp: '198.51.100.7',
            destinationIp: '10.0.0.1',
            protocol: 'TCP',
            port: '1-1024',
            technique: 'T1046',
            host: 'gw-01',
            detector: 'Firewall',
            description: 'The source probed 1,024 TCP ports in 40 seconds.'
        },
        {
            id: 'INC-1003',
            event: 'Phishing email',
            severity: 'Medium',
            status: 'Resolved',
            sourceIp: '192.0.2.15',
            destinationIp: '10.0.2.5',
            protocol: 'SMTP',
            port: '25',
            technique: 'T1566.001',
            host: 'mail-01',
            detector: 'Mail gateway',
            description: 'An email with a spoofed sender and a macro-enabled attachment reached 12 mailboxes.'
        },
        {
            id: 'INC-1004',
            event: 'Malware detected',
            severity: 'Critical',
            status: 'In progress',
            sourceIp: '203.0.113.91',
            destinationIp: '10.0.3.12',
            protocol: 'HTTPS',
            port: '443',
            technique: 'T1204.002',
            host: 'ws-12',
            detector: 'EDR',
            description: 'The antivirus quarantined a trojan that a browser had downloaded.'
        },
        {
            id: 'INC-1005',
            event: 'DNS tunneling',
            severity: 'High',
            status: 'New',
            sourceIp: '198.51.100.33',
            destinationIp: '10.0.0.53',
            protocol: 'DNS',
            port: '53',
            technique: 'T1071.004',
            host: 'dns-01',
            detector: 'DNS monitoring',
            description: 'Over 3,000 long random subdomains of a single domain were resolved within an hour.'
        },
        {
            id: 'INC-1006',
            event: 'Privilege escalation',
            severity: 'Critical',
            status: 'New',
            sourceIp: '192.0.2.48',
            destinationIp: '10.0.0.10',
            protocol: 'LDAP',
            port: '389',
            technique: 'T1098',
            host: 'dc-01',
            detector: 'SIEM',
            description: 'A user was added to the Domain Admins group outside the change window.'
        },
        {
            id: 'INC-1007',
            event: 'Data exfiltration',
            severity: 'Critical',
            status: 'In progress',
            sourceIp: '10.0.4.20',
            destinationIp: '203.0.113.150',
            protocol: 'HTTPS',
            port: '443',
            technique: 'T1567',
            host: 'db-01',
            detector: 'DLP',
            description: '4.2 GB were uploaded to an unknown external host outside business hours.'
        },
        {
            id: 'INC-1008',
            event: 'Obfuscated script',
            severity: 'Medium',
            status: 'New',
            sourceIp: '198.51.100.62',
            destinationIp: '10.0.3.3',
            protocol: 'WinRM',
            port: '5986',
            technique: 'T1027',
            host: 'ws-03',
            detector: 'EDR',
            description: 'PowerShell ran a Base64-encoded command that disables script logging.'
        }
    ];

    /**
     * Clicking a cell expands and collapses its row. The expanded part is not a cell, so clicking
     * inside it never reaches this handler.
     */
    protected onCellClicked({ node, column }: CellClickedEvent, rowDetail: KbqAgGridRowDetail): void {
        // Leave the selection checkbox to the selection column itself.
        if (!node.id || column.getColId() === SELECTION_COLUMN_ID) return;

        rowDetail.toggle(node.id);
    }

    protected onCellKeyDown(
        { event, node }: CellKeyDownEvent | FullWidthCellKeyDownEvent,
        rowDetail: KbqAgGridRowDetail
    ): void {
        if (!(event instanceof KeyboardEvent) || event.key !== 'Enter' || !node.id) return;

        // The expand toggle is a button and handles Enter itself.
        if (event.target instanceof HTMLButtonElement) return;

        rowDetail.toggle(node.id);
    }
}

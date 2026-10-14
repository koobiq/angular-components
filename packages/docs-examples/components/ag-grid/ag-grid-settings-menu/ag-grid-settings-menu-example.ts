import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
    KBQ_AG_GRID_COLUMN_MENU_LABELS_EN,
    KBQ_AG_GRID_SETTINGS_MENU_LABELS_EN,
    kbqAgGridColumnMenuLabelsProvider,
    kbqAgGridSettingsMenuColumnsItem,
    KbqAgGridSettingsMenuItems,
    kbqAgGridSettingsMenuLabelsProvider,
    kbqAgGridSettingsMenuSeparator,
    kbqAgGridSettingsMenuSortItem,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

// Row heights of --kbq-size-3xl and --kbq-size-4xl, the default row height of the theme.
const EXAMPLE_COMPACT_DENSITY = { id: 'compact', label: 'Compact', rowHeight: 32 };
const EXAMPLE_NORMAL_DENSITY = { id: 'normal', label: 'Normal', rowHeight: 40 };

const EXAMPLE_SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];
const EXAMPLE_STATUSES = ['New', 'In progress', 'Resolved'];
const EXAMPLE_ATTACK_TYPES = ['Brute force', 'Phishing', 'Port scan', 'Malware', 'DNS tunneling'];

/**
 * @title AG Grid with `KbqAgGridSettingsMenu` directive
 */
@Component({
    selector: 'ag-grid-settings-menu-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridToNextRowByTab
            kbqAgGridSettingsMenu
            [alwaysMultiSort]="true"
            [kbqAgGridSettingsMenuItems]="settingsMenuItems"
            [rowHeight]="density().rowHeight"
            [style.height.px]="400"
            [columnDefs]="columnDefs"
            [rowData]="rowData"
        />
    `,
    providers: [
        kbqAgGridSettingsMenuLabelsProvider(KBQ_AG_GRID_SETTINGS_MENU_LABELS_EN),
        // The Columns screen takes its labels from the column menu.
        kbqAgGridColumnMenuLabelsProvider(KBQ_AG_GRID_COLUMN_MENU_LABELS_EN)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridSettingsMenuExample {
    protected readonly density = signal(EXAMPLE_NORMAL_DENSITY);

    protected readonly settingsMenuItems: KbqAgGridSettingsMenuItems = [
        kbqAgGridSettingsMenuColumnsItem(),
        kbqAgGridSettingsMenuSortItem(),
        kbqAgGridSettingsMenuSeparator(),
        // A custom item: the menu has no built-in density setting.
        {
            id: 'density',
            label: 'Density',
            icon: 'kbq-bars-sort-center_16',
            mode: 'single',
            value: computed(() => this.density().label),
            items: [EXAMPLE_COMPACT_DENSITY, EXAMPLE_NORMAL_DENSITY].map((density) => ({
                id: density.id,
                label: density.label,
                checked: computed(() => this.density() === density),
                keepOpen: true,
                action: () => this.density.set(density)
            }))
        }
    ];

    protected readonly columnDefs: ColDef[] = [
        {
            field: 'incidentId',
            headerName: 'Incident ID',
            pinned: 'left',
            lockVisible: true,
            lockPinned: true,
            width: 120
        },
        { field: 'severity', headerName: 'Severity', width: 110 },
        { field: 'status', headerName: 'Status', width: 120 },
        { field: 'attackType', headerName: 'Attack type', width: 170 },
        { field: 'sourceIp', headerName: 'Source IP', hide: true, width: 150 },
        { field: 'affectedHost', headerName: 'Affected host', hide: true, width: 150 }
    ];

    protected readonly rowData = Array.from({ length: 30 }, (_, index) => ({
        incidentId: `INC-${1001 + index}`,
        severity: EXAMPLE_SEVERITIES[index % EXAMPLE_SEVERITIES.length],
        status: EXAMPLE_STATUSES[index % EXAMPLE_STATUSES.length],
        attackType: EXAMPLE_ATTACK_TYPES[index % EXAMPLE_ATTACK_TYPES.length],
        sourceIp: `192.0.2.${index + 1}`,
        affectedHost: `srv-0${(index % 9) + 1}`
    }));
}

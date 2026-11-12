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
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';
import { ExampleText, TEXT } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

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
            [kbqAgGridSettingsMenuItems]="settingsMenuItems()"
            [rowHeight]="density().rowHeight"
            [style.height.px]="400"
            [columnDefs]="columnDefs()"
            [rowData]="rowData()"
        />
    `,
    providers: [
        kbqAgGridSettingsMenuLabelsProvider(KBQ_AG_GRID_SETTINGS_MENU_LABELS_EN),
        // The Columns screen takes its labels from the column menu.
        kbqAgGridColumnMenuLabelsProvider(KBQ_AG_GRID_COLUMN_MENU_LABELS_EN)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridSettingsMenuExample extends BaseLocalizedExample<ExampleText> {
    // Row heights of --kbq-size-3xl and --kbq-size-4xl, the default row height of the theme.
    private readonly densities = computed(() => [
        { id: 'compact', label: this.text().compact, rowHeight: 32 },
        { id: 'normal', label: this.text().normal, rowHeight: 40 }
    ]);

    protected readonly density = signal(this.densities()[1]);

    protected readonly settingsMenuItems = computed<KbqAgGridSettingsMenuItems>(() => [
        kbqAgGridSettingsMenuColumnsItem(),
        kbqAgGridSettingsMenuSortItem(),
        kbqAgGridSettingsMenuSeparator(),
        // A custom item: the menu has no built-in density setting.
        {
            id: 'density',
            label: this.text().density,
            icon: 'kbq-bars-sort-center_16',
            mode: 'single',
            value: computed(() => this.density().label),
            items: this.densities().map((density) => ({
                id: density.id,
                label: density.label,
                checked: computed(() => this.density() === density),
                keepOpen: true,
                action: () => this.density.set(density)
            }))
        }
    ]);

    protected readonly columnDefs = computed<ColDef[]>(() => [
        {
            field: 'incidentId',
            headerName: this.text().incidentId,
            pinned: 'left',
            lockVisible: true,
            lockPinned: true,
            width: 120
        },
        { field: 'severity', headerName: this.text().severity, width: 110 },
        { field: 'status', headerName: this.text().status, width: 120 },
        { field: 'attackType', headerName: this.text().attackType, width: 170 },
        { field: 'sourceIp', headerName: this.text().sourceIp, hide: true, width: 150 },
        { field: 'affectedHost', headerName: this.text().affectedHost, hide: true, width: 150 }
    ]);

    protected readonly rowData = computed(() =>
        Array.from({ length: 30 }, (_, index) => ({
            incidentId: `INC-${1001 + index}`,
            severity: this.text().severities[index % this.text().severities.length],
            status: this.text().statuses[index % this.text().statuses.length],
            attackType: this.text().attackTypes[index % this.text().attackTypes.length],
            sourceIp: `192.0.2.${index + 1}`,
            affectedHost: `srv-0${(index % 9) + 1}`
        }))
    );

    constructor() {
        super(TEXT);
    }
}

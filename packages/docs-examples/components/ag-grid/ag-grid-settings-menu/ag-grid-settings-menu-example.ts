import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import {
    KBQ_AG_GRID_COLUMN_MENU_LABELS_EN,
    KBQ_AG_GRID_SETTINGS_MENU_LABELS_EN,
    kbqAgGridColumnMenuLabelsProvider,
    kbqAgGridSettingsMenuColumnsItem,
    type KbqAgGridSettingsMenuItems,
    kbqAgGridSettingsMenuLabelsProvider,
    kbqAgGridSettingsMenuSeparator,
    kbqAgGridSettingsMenuSortItem,
    KbqAgGridThemeModule
} from '@koobiq/ag-grid-angular-theme';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { exampleIncidentColumns } from '../incident-columns';
import { exampleGetIncidents } from '../security-incidents';
import { TRANSLATIONS } from './l10n';

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
    protected readonly t = injectTranslation(TRANSLATIONS);

    // Row heights of --kbq-size-3xl and --kbq-size-4xl, the default row height of the theme.
    private readonly densities = computed(() => [
        { id: 'compact', label: this.t().compact, rowHeight: 32 },
        { id: 'normal', label: this.t().normal, rowHeight: 40 }
    ]);

    protected readonly density = signal(this.densities()[1]!);

    protected readonly settingsMenuItems = computed<KbqAgGridSettingsMenuItems>(() => [
        kbqAgGridSettingsMenuColumnsItem(),
        kbqAgGridSettingsMenuSortItem(),
        kbqAgGridSettingsMenuSeparator(),
        // A custom item: the menu has no built-in density setting.
        {
            id: 'density',
            label: this.t().density,
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

    protected readonly columnDefs = computed(() =>
        exampleIncidentColumns(
            this.t().headers,
            { field: 'id', pinned: 'left', lockVisible: true, lockPinned: true },
            'connection',
            'severity',
            'status',
            'category',
            { field: 'assignee', hide: true },
            { field: 'sourceIp', hide: true },
            { field: 'affectedHost', hide: true }
        )
    );

    protected readonly rowData = exampleGetIncidents(0, 30);
}

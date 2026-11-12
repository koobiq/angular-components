import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Tab list with selection by index
 */
@Component({
    selector: 'tabs-active-tab-index-example',
    imports: [
        KbqTabsModule,
        KbqIconModule
    ],
    template: `
        <kbq-tab-group [(activeTab)]="selectedTabIndex">
            @for (tab of tabs; track tab) {
                <kbq-tab [tabId]="tab.tabId">
                    <ng-template kbq-tab-label>
                        <i [kbq-icon]="tab.icon"></i>
                        {{ tab.label }}
                    </ng-template>
                    Content for selected tab with index: {{ selectedTabIndex }}
                </kbq-tab>
            }
        </kbq-tab-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsActiveTabIndexExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly tabs = [
        { tabId: 'files', icon: 'kbq-folder-open_16', label: this.t().files },
        { tabId: 'settings', icon: 'kbq-gear_16', label: this.t().settings },
        { tabId: 'tasks', icon: 'kbq-bars-horizontal_16', label: this.t().tasks }
    ];

    selectedTabIndex: number = 1;

    constructor() {
        super(TRANSLATIONS);
    }
}

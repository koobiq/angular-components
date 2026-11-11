import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { injectExampleText } from '../l10n';

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
export class TabsActiveTabIndexExample {
    protected readonly text = injectExampleText();

    readonly tabs = [
        { tabId: 'files', icon: 'kbq-folder-open_16', label: this.text().files },
        { tabId: 'settings', icon: 'kbq-gear_16', label: this.text().settings },
        { tabId: 'tasks', icon: 'kbq-bars-horizontal_16', label: this.text().tasks }
    ];

    selectedTabIndex: number = 1;
}

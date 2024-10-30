import { Component } from '@angular/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tab list with selection by tabId
 */
@Component({
    standalone: true,
    selector: 'tab-active-tab-example',
    imports: [
        KbqTabsModule,
        KbqIcon
    ],
    template: `
        <kbq-tab-group [(activeTab)]="selectedTabId">
            @for (tab of tabs; track tab) {
                <kbq-tab [tabId]="tab.tabId">
                    <ng-template kbq-tab-label>
                        <i
                            [ngClass]="tab.icon"
                            kbq-icon
                        ></i>
                        {{ tab.tabId }}
                    </ng-template>
                    Content for selected tab with tabId={{ selectedTabId }}
                </kbq-tab>
            }
        </kbq-tab-group>
    `
})
export class TabActiveTabExample {
    selectedTabId = 'settings';

    tabs = [
        { tabId: 'files', icon: 'kbq-folder-open_16' },
        { tabId: 'settings', icon: 'kbq-gear_16' },
        { tabId: 'tasks', icon: 'kbq-bars-horizontal_16' }
    ];
}

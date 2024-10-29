import { Component } from '@angular/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tab list with selection by index
 */
@Component({
    standalone: true,
    selector: 'tab-active-tab-index-example',
    templateUrl: 'tab-active-tab-index-example.html',
    imports: [
        KbqTabsModule,
        KbqIcon
    ]
})
export class TabActiveTabIndexExample {
    tabs = [
        { tabId: 'files', icon: 'kbq-folder-open_16' },
        { tabId: 'settings', icon: 'kbq-gear_16' },
        { tabId: 'tasks', icon: 'kbq-bars-horizontal_16' }
    ];

    selectedTabIndex = this.tabs.findIndex(({ tabId }) => tabId === 'settings');
}

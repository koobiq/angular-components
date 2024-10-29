import { Component } from '@angular/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tab list with selection by tabId
 */
@Component({
    standalone: true,
    selector: 'tab-active-tab-example',
    templateUrl: 'tab-active-tab-example.html',
    imports: [
        KbqTabsModule,
        KbqIcon
    ]
})
export class TabActiveTabExample {
    selectedTabId = 'settings';

    tabs = [
        { tabId: 'files', icon: 'kbq-folder-open_16' },
        { tabId: 'settings', icon: 'kbq-gear_16' },
        { tabId: 'tasks', icon: 'kbq-bars-horizontal_16' }
    ];
}

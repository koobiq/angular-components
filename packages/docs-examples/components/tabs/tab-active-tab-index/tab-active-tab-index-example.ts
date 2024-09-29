import { Component, ViewEncapsulation } from '@angular/core';

/**
 * @title Tab list with selection by index
 */
@Component({
    selector: 'tab-active-tab-index-example',
    templateUrl: 'tab-active-tab-index-example.html',
    styleUrls: ['tab-active-tab-index-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TabActiveTabIndexExample {
    tabs = [
        { tabId: 'files', icon: 'kbq-folder-open_16' },
        { tabId: 'settings', icon: 'kbq-gear_16' },
        { tabId: 'tasks', icon: 'kbq-bars-horizontal_16' }
    ];

    selectedTabIndex = this.tabs.findIndex(({ tabId }) => tabId === 'settings');
}

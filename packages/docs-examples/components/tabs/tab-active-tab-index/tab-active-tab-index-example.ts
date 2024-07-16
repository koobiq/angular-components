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
        { tabId: 'files', icon: 'mc-folder-opened_16' },
        { tabId: 'settings', icon: 'mc-gear_16' },
        { tabId: 'tasks', icon: 'mc-hamburger_16' }
    ];

    selectedTabIndex = this.tabs.findIndex(({ tabId }) => tabId === 'settings');
}

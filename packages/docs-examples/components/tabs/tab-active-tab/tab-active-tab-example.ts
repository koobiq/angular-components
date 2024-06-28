import { Component, ViewEncapsulation } from '@angular/core';


/**
 * @title Tab list with selection by tabId
 */
@Component({
    selector: 'tab-active-tab-example',
    templateUrl: 'tab-active-tab-example.html',
    styleUrls: ['tab-active-tab-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TabActiveTabExample {
    selectedTabId = 'settings';

    tabs = [
        { tabId: 'files', icon: 'mc-folder-opened_16' },
        { tabId: 'settings', icon: 'mc-gear_16' },
        { tabId: 'tasks', icon: 'mc-hamburger_16'  }
    ];
}

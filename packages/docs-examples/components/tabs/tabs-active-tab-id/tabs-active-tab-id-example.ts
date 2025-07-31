import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tab list with selection by tab id
 */
@Component({
    standalone: true,
    selector: 'tabs-active-tab-id-example',
    imports: [
        KbqTabsModule,
        KbqIconModule,
        NgClass
    ],
    template: `
        <kbq-tab-group [(activeTab)]="selectedTabId">
            @for (tab of tabs; track tab) {
                <kbq-tab [tabId]="tab.tabId">
                    <ng-template kbq-tab-label>
                        <i kbq-icon [ngClass]="tab.icon"></i>
                        {{ tab.tabId }}
                    </ng-template>
                    Content for selected tab with id: {{ selectedTabId }}
                </kbq-tab>
            }
        </kbq-tab-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsActiveTabIdExample {
    readonly tabs = [
        { tabId: 'files', icon: 'kbq-folder-open_16' },
        { tabId: 'settings', icon: 'kbq-gear_16' },
        { tabId: 'tasks', icon: 'kbq-bars-horizontal_16' }
    ];

    selectedTabId: string = 'settings';
}

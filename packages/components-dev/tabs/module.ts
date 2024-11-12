import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqTabChangeEvent, KbqTabsModule } from '@koobiq/components/tabs';

@Component({
    standalone: true,
    imports: [
        KbqIconModule,
        KbqTabsModule,
        KbqPopoverModule,
        KbqButtonModule,
        NgClass
    ],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tabs {
    readonly tabs = new Array(50).fill(0).map((_, index) => `Tab ${index}`);
    readonly links = new Array(10).fill(0).map((_, index) => `Link ${index}`);
    activeLink = this.links[2];
    readonly tabsWithIcons = [
        { tabId: 'files', icon: 'kbq-folder-open_16' },
        { tabId: 'settings', icon: 'kbq-gear_16' },
        { tabId: 'tasks', icon: 'kbq-bars-horizontal_16' }
    ];
    selectedTabIndex: number;
    readonly dashboards = new Array(2).fill(0).map((_, index) => `Dashboard ${index}`);
    activeDashboard = this.dashboards[0];

    selectedTabChange(event: KbqTabChangeEvent): void {
        console.log('selectedTabChange Event:', event);
    }

    createDashboard(): void {
        this.dashboards.push(`Dashboard ${this.dashboards.length + 1}`);
        this.activeDashboard = this.dashboards[this.dashboards.length - 1];
    }
}

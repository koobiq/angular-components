import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs add tab
 */
@Component({
    selector: 'tabs-add-tab-example',
    imports: [KbqTabsModule, KbqButtonModule, KbqIconModule],
    template: `
        <nav kbqTabNavBar class="example-tab-nav-bar">
            @for (tab of tabs; track tab) {
                <a kbqTabLink [active]="activeTab === tab" (click)="activeTab = tab">
                    {{ tab }}
                    @if (activeTab === tab) {
                        <div class="example-tab-close">
                            <i
                                kbq-icon-button="kbq-xmark-s_16"
                                color="contrast-fade"
                                (click)="removeTab(tab, $event)"
                            ></i>
                        </div>
                    }
                </a>
            }
        </nav>
        <button color="contrast" kbqStyle="transparent" kbq-button (click)="addTab()">
            <i kbq-icon="kbq-plus_16"></i>
        </button>
    `,
    styleUrls: ['./tabs-add-tab-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsAddTabExample {
    protected tabs = ['BruteForce', 'Complex Attack', 'DDoS', 'HIPS alert'];
    protected activeTab = this.tabs[0];

    protected addTab(): void {
        const newTab = `Tab ${this.tabs.length + 1}`;

        this.tabs = [...this.tabs, newTab];
        this.activeTab = newTab;
    }

    protected removeTab(tab: string, event: MouseEvent): void {
        event.stopPropagation();
        const index = this.tabs.indexOf(tab);

        this.tabs = this.tabs.filter((t) => t !== tab);

        if (this.tabs.length > 0) {
            this.activeTab = this.tabs[Math.max(0, index - 1)];
        }
    }
}

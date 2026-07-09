import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs add tab vertical
 */
@Component({
    selector: 'tabs-add-tab-vertical-example',
    imports: [KbqTabsModule, KbqButtonModule, KbqIconModule],
    template: `
        <nav kbqTabNavBar vertical class="example-tab-nav-bar" [tabNavPanel]="tabNavPanel">
            @for (tab of tabs; track tab) {
                <a kbqTabLink class="example-tab-link" [active]="activeTab === tab" (click)="activeTab = tab">
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
            <button color="contrast-fade" kbq-button (click)="addTab()">
                <i kbq-icon="kbq-plus_16"></i>
            </button>
        </nav>

        <div #tabNavPanel="kbqTabNavPanel" kbqTabNavPanel class="example-tabs-add-tab-vertical__content">
            Content for {{ activeTab }}
        </div>
    `,
    styleUrls: ['./tabs-add-tab-vertical-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsAddTabVerticalExample {
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

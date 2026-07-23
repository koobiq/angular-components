import { ChangeDetectionStrategy, Component, viewChildren } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabLink, KbqTabsModule } from '@koobiq/components/tabs';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tabs add tab
 */
@Component({
    selector: 'tabs-add-tab-example',
    imports: [KbqTabsModule, KbqButtonModule, KbqIconModule, KbqToolTipModule],
    template: `
        <nav kbqTabNavBar class="example-tab-nav-bar">
            @for (tab of tabs; track tab) {
                <a
                    kbqTabLink
                    [active]="activeTab === tab"
                    (click)="activeTab = tab"
                    (keydown.enter)="activeTab = tab"
                    (keydown.space)="activeTab = tab; $event.preventDefault()"
                >
                    {{ tab }}
                    @if (activeTab === tab) {
                        <div class="example-tab-close">
                            <i
                                kbqTooltip="Remove tab"
                                tabindex="-1"
                                kbq-icon-button="kbq-xmark-s_16"
                                color="contrast-fade"
                                (click)="removeTab(tab, $event)"
                            ></i>
                        </div>
                    }
                </a>
            }
        </nav>
        <button color="contrast" kbqStyle="transparent" kbq-button kbqTooltip="Add tab" (click)="addTab()">
            <i kbq-icon="kbq-plus_16"></i>
        </button>
    `,
    styleUrls: ['./tabs-add-tab-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsAddTabExample {
    // private readonly injector = inject(Injector);
    private readonly tabLinks = viewChildren(KbqTabLink);
    protected tabs = ['BruteForce', 'Complex Attack', 'DDoS', 'HIPS alert'];
    protected activeTab = this.tabs[0];

    protected addTab(): void {
        const newTab = `Tab ${this.tabs.length + 1}`;

        this.tabs = [...this.tabs, newTab];
        this.activeTab = newTab;

        setTimeout(() => this.tabLinks().at(-1)?.focus(), 100);
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

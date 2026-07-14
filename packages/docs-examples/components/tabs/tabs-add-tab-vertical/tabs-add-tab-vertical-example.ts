import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tabs add tab vertical
 */
@Component({
    selector: 'tabs-add-tab-vertical-example',
    imports: [KbqTabsModule, KbqButtonModule, KbqIconModule, KbqToolTipModule],
    template: `
        <div class="example-tab-nav-bar__wrapper">
            <nav kbqTabNavBar vertical class="example-tab-nav-bar" [tabNavPanel]="tabNavPanel">
                @for (tab of tabs; track tab) {
                    <a kbqTabLink class="example-tab-link" [active]="activeTab === tab" (click)="activeTab = tab">
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
            <div class="example-tab-add-button-container">
                <button
                    color="contrast-fade"
                    kbq-button
                    kbqTooltip="Add tab"
                    (click)="addTab()"
                    (keydown)="$event.stopPropagation()"
                >
                    <i kbq-icon="kbq-plus_16"></i>
                </button>
            </div>
        </div>

        <div #tabNavPanel="kbqTabNavPanel" kbqTabNavPanel class="example-tabs-add-tab-vertical__content">
            <h2 [style.margin-top.px]="0">{{ activeTab }}</h2>
            <p>
                In cryptography, a brute-force attack consists of an attacker submitting many passwords or passphrases
                with the hope of eventually guessing correctly. The attacker systematically checks all possible
                passwords and passphrases until the correct one is found. Alternatively, the attacker can attempt to
                guess the key which is typically created from the password using a key derivation function. This is
                known as an exhaustive key search. This approach doesn't depend on intellectual tactics; rather, it
                relies on making several attempts.
            </p>
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

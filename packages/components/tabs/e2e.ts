import { afterNextRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

@Component({
    selector: 'e2e-tabs-states',
    imports: [KbqTabsModule, KbqIconModule],
    template: `
        <!-- base -->
        <kbq-tab-group>
            @for (tab of tabs.slice(0, 2); track tab) {
                <kbq-tab [tabId]="tab" [disabled]="$index === 1" [label]="tab">Active tab is {{ tab }}</kbq-tab>
            }
        </kbq-tab-group>

        <!-- base with icons -->
        <kbq-tab-group [activeTab]="tabs[5]">
            @for (tab of tabs; track tab) {
                <kbq-tab [tabId]="tab">
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                        {{ tab }}
                    </ng-template>
                    Active tab is {{ tab }}
                </kbq-tab>
            }
        </kbq-tab-group>

        <!-- underlined -->
        <kbq-tab-group underlined data-testid="e2eTabsUnderlined">
            @for (tab of tabs; track tab) {
                <kbq-tab [tabId]="tab" [disabled]="$index === 1">
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                        {{ tab }}
                    </ng-template>
                    Active tab is {{ tab }}
                </kbq-tab>
            }
        </kbq-tab-group>

        <!-- underlined with icons only -->
        <kbq-tab-group underlined data-testid="e2eTabsUnderlinedIconsOnly">
            @for (tab of tabs.slice(0, 5); track tab) {
                <kbq-tab>
                    <ng-template kbqTabLabel iconOnly>
                        <i kbq-icon="kbq-bug_16"></i>
                    </ng-template>
                </kbq-tab>
            }
        </kbq-tab-group>

        <!-- stretched -->
        <kbq-tab-group kbq-stretch-tabs [activeTab]="tabs[2]">
            @for (tab of tabs.slice(0, 2); track tab) {
                <kbq-tab [disabled]="$first" [tabId]="tab" [label]="tab">Active tab is {{ tab }}</kbq-tab>
            }
        </kbq-tab-group>

        <!-- stretched with icons -->
        <kbq-tab-group kbq-stretch-tabs>
            @for (tab of tabs.slice(0, 2); track tab) {
                <kbq-tab [tabId]="tab">
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                        {{ tab }}
                    </ng-template>
                    Active tab is {{ tab }}
                </kbq-tab>
            }
        </kbq-tab-group>

        <!-- stretched and underlined -->
        <kbq-tab-group kbq-stretch-tabs underlined>
            @for (tab of tabs.slice(0, 2); track tab) {
                <kbq-tab [tabId]="tab" [disabled]="$last">
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                        {{ tab }}
                    </ng-template>
                    Active tab is {{ tab }}
                </kbq-tab>
            }
        </kbq-tab-group>

        <!-- vertical -->
        <kbq-tab-group vertical [style.height.px]="100">
            @for (tab of tabs; track tab) {
                <kbq-tab [disabled]="$index === 1" [tabId]="tab" [label]="tab">Active tab is {{ tab }}</kbq-tab>
            }
        </kbq-tab-group>

        <!-- vertical with icons -->
        <kbq-tab-group vertical [style.height.px]="100" [activeTab]="tabs[2]">
            @for (tab of tabs; track tab) {
                <kbq-tab [tabId]="tab" [disabled]="$index === 1">
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                        {{ tab }}
                    </ng-template>
                    Active tab is {{ tab }}
                </kbq-tab>
            }
        </kbq-tab-group>

        <!-- vertical with icons only -->
        <kbq-tab-group vertical data-testid="e2eTabsVerticalIconsOnly" [style.height.px]="130" [activeTab]="tabs[2]">
            @for (tab of tabs; track tab) {
                <kbq-tab [tabId]="tab" [disabled]="$index === 1">
                    <ng-template kbqTabLabel iconOnly>
                        <i kbq-icon="kbq-bug_16"></i>
                    </ng-template>
                    Active tab is {{ tab }}
                </kbq-tab>
            }
        </kbq-tab-group>

        <!-- base on-surface -->
        <kbq-tab-group [onSurface]="true">
            @for (tab of tabs.slice(0, 2); track tab) {
                <kbq-tab [tabId]="tab" [disabled]="$index === 1" [label]="tab">Active tab is {{ tab }}</kbq-tab>
            }
        </kbq-tab-group>

        <!-- base with icons on-surface -->
        <kbq-tab-group [onSurface]="true" [activeTab]="tabs[5]">
            @for (tab of tabs; track tab) {
                <kbq-tab [tabId]="tab">
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                        {{ tab }}
                    </ng-template>
                    Active tab is {{ tab }}
                </kbq-tab>
            }
        </kbq-tab-group>

        <!-- underlined on-surface -->
        <kbq-tab-group underlined [onSurface]="true">
            @for (tab of tabs; track tab) {
                <kbq-tab [tabId]="tab" [disabled]="$index === 1">
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                        {{ tab }}
                    </ng-template>
                    Active tab is {{ tab }}
                </kbq-tab>
            }
        </kbq-tab-group>

        <!-- vertical on-surface -->
        <kbq-tab-group vertical [onSurface]="true" [style.height.px]="100">
            @for (tab of tabs; track tab) {
                <kbq-tab [disabled]="$index === 1" [tabId]="tab" [label]="tab">Active tab is {{ tab }}</kbq-tab>
            }
        </kbq-tab-group>
    `,
    styles: `
        :host {
            box-sizing: border-box;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-xs);
            width: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTabsStates'
    }
})
export class E2eTabsStates {
    protected readonly tabs = [
        'BruteForce',
        'Complex Attack',
        'DDoS',
        'HIPS alert',
        'IDS/IPS Alert',
        'Zero-Day Exploit',
        'XSS',
        'Malware',
        'Ransomware',
        'Phishing'
    ] as const;

    constructor() {
        afterNextRender(() => {
            this.setupTabsUnderlinedIconsOnlyStates();
            this.setupTabsVerticalIconsOnlyStates();
        });
    }

    private setupTabsUnderlinedIconsOnlyStates(): void {
        const labels = document.querySelectorAll('[data-testid="e2eTabsUnderlinedIconsOnly"] .kbq-tab-label');

        labels[0].classList.add('kbq-hover');
        labels[0].classList.add('cdk-keyboard-focused');

        labels[1].classList.add('kbq-hover');

        labels[2].classList.add('kbq-hover');
        labels[2].classList.add('cdk-keyboard-focused');

        labels[4].classList.add('cdk-keyboard-focused');
    }

    private setupTabsVerticalIconsOnlyStates(): void {
        const labels = document.querySelectorAll('[data-testid="e2eTabsVerticalIconsOnly"] .kbq-tab-label');

        labels[0].classList.add('cdk-keyboard-focused');

        labels[2].classList.add('cdk-keyboard-focused');
    }
}

type TabNavBarScenario = { testid: string; disabled: boolean };

@Component({
    selector: 'e2e-tab-nav-bar',
    imports: [KbqTabsModule],
    template: `
        @for (s of scenarios; track s.testid) {
            <div [attr.data-testid]="s.testid">
                <nav kbqTabNavBar>
                    <a kbqTabLink [disabled]="s.disabled">Tab link</a>
                </nav>
            </div>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTabNavBar'
    }
})
export class E2eTabNavBar {
    protected readonly scenarios: TabNavBarScenario[] = [
        { testid: 'tabNavBar_default', disabled: false },
        { testid: 'tabNavBar_disabled', disabled: true }
    ];
}

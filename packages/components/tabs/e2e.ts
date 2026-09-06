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

        <!-- stretched -->
        <kbq-tab-group kbq-stretch-tabs [activeTab]="tabs[2]">
            @for (tab of tabs.slice(0, 2); track tab) {
                <kbq-tab [disabled]="$first" [tabId]="tab" [label]="tab">Active tab is {{ tab }}</kbq-tab>
            }
        </kbq-tab-group>

        <!-- underlined with text and icon states -->
        <kbq-tab-group underlined data-testid="e2eTabsUnderlinedTextIcon">
            @for (tab of tabs.slice(0, 4); track tab) {
                <kbq-tab [tabId]="tab" [disabled]="$index === 3">
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                        Text {{ $index }}
                    </ng-template>
                    Active tab is {{ tab }}
                </kbq-tab>
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

        <!-- underlined with text and icon disabled -->
        <kbq-tab-group underlined data-testid="e2eTabsUnderlinedTextIconDisabled" [onSurface]="true">
            @for (tab of tabs.slice(0, 1); track tab) {
                <kbq-tab [tabId]="tab" [disabled]="$first">
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                        Text {{ $index }}
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

        <!-- transparent -->
        <kbq-tab-group [transparent]="true">
            @for (tab of tabs.slice(0, 2); track tab) {
                <kbq-tab [tabId]="tab" [disabled]="$index === 1" [label]="tab">Active tab is {{ tab }}</kbq-tab>
            }
        </kbq-tab-group>

        <!-- transparent on-surface -->
        <kbq-tab-group [transparent]="true" [onSurface]="true">
            @for (tab of tabs.slice(0, 2); track tab) {
                <kbq-tab [tabId]="tab" [disabled]="$index === 1" [label]="tab">Active tab is {{ tab }}</kbq-tab>
            }
        </kbq-tab-group>

        <!-- vertical bound to false: the layout must follow the binding, not the attribute -->
        <kbq-tab-group data-testid="e2eTabsVerticalBoundFalse" [vertical]="false">
            @for (tab of tabs.slice(0, 2); track tab) {
                <kbq-tab [tabId]="tab" [label]="tab">Active tab is {{ tab }}</kbq-tab>
            }
        </kbq-tab-group>

        <!-- nav bar on-surface -->
        <nav kbqTabNavBar [onSurface]="true">
            @for (tab of tabs.slice(0, 3); track tab) {
                <a kbqTabLink [active]="$first" [disabled]="$index === 1">{{ tab }}</a>
            }
        </nav>

        <!-- nav bar transparent on-surface -->
        <nav kbqTabNavBar [transparent]="true" [onSurface]="true">
            @for (tab of tabs.slice(0, 3); track tab) {
                <a kbqTabLink [active]="$first" [disabled]="$index === 1">{{ tab }}</a>
            }
        </nav>
    `,
    styles: `
        :host {
            display: inline-grid;
            grid-template-columns: repeat(3, 400px);
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-xs);
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
            this.setupTabsUnderlinedTextIconStates();
            this.setupTabsVerticalIconsOnlyStates();
        });
    }

    /**
     * Indexing `querySelectorAll` results by hand fails silently: an out-of-range index throws inside
     * the `afterNextRender` callback, Angular routes that to the `ErrorHandler`, and the screenshot
     * still matches its own (wrong) baseline. Naming the fixture makes the failure legible instead.
     */
    private setStates(testid: string, states: Record<number, string[]>): void {
        const labels = document.querySelectorAll(`[data-testid="${testid}"] .kbq-tab-label`);

        for (const [index, classNames] of Object.entries(states)) {
            const label = labels[Number(index)];

            if (!label) {
                throw new Error(
                    `e2e-tabs-states: "${testid}" has ${labels.length} labels, no index ${index} to style.`
                );
            }

            label.classList.add(...classNames);
        }
    }

    private setupTabsUnderlinedIconsOnlyStates(): void {
        this.setStates('e2eTabsUnderlinedIconsOnly', {
            0: ['kbq-hover', 'cdk-keyboard-focused'],
            1: ['kbq-hover'],
            2: ['kbq-hover', 'cdk-keyboard-focused'],
            4: ['cdk-keyboard-focused']
        });
    }

    private setupTabsUnderlinedTextIconStates(): void {
        // The group renders `tabs.slice(0, 4)`, so the last label is index 3.
        this.setStates('e2eTabsUnderlinedTextIcon', {
            0: ['kbq-hover', 'cdk-keyboard-focused'],
            1: ['kbq-hover'],
            2: ['kbq-hover', 'cdk-keyboard-focused'],
            3: ['cdk-keyboard-focused']
        });
    }

    private setupTabsVerticalIconsOnlyStates(): void {
        this.setStates('e2eTabsVerticalIconsOnly', {
            0: ['cdk-keyboard-focused'],
            2: ['cdk-keyboard-focused']
        });
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

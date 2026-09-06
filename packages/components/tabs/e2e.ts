import { afterNextRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * Applies visual-state classes to the tab labels of the group marked with `testid`.
 *
 * Throws on an index the group doesn't have, rather than letting an out-of-range access quietly drop the
 * state and rewrite a screenshot baseline the next time the group's tab count changes.
 */
const e2eTabLabelStateSetter = (testid: string) => {
    const labels = document.querySelectorAll(`[data-testid="${testid}"] .kbq-tab-label`);

    return (index: number, ...classes: string[]): void => {
        const label = labels[index];

        if (!label) {
            throw new Error(`[${testid}] no .kbq-tab-label at index ${index}, the group has ${labels.length}`);
        }

        label.classList.add(...classes);
    };
};

@Component({
    selector: 'e2e-tabs-states',
    imports: [KbqTabsModule, KbqIconModule],
    template: `
        <!-- base -->
        <kbq-tab-group [useStateSaving]="false">
            @for (tab of tabs.slice(0, 2); track tab) {
                <kbq-tab [tabId]="tab" [disabled]="$index === 1" [label]="tab">Active tab is {{ tab }}</kbq-tab>
            }
        </kbq-tab-group>

        <!-- base with icons -->
        <kbq-tab-group [useStateSaving]="false" [activeTab]="tabs[5]">
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
        <kbq-tab-group underlined data-testid="e2eTabsUnderlinedIconsOnly" [useStateSaving]="false">
            @for (tab of tabs.slice(0, 5); track tab) {
                <kbq-tab>
                    <ng-template kbqTabLabel iconOnly>
                        <i kbq-icon="kbq-bug_16"></i>
                    </ng-template>
                </kbq-tab>
            }
        </kbq-tab-group>

        <!-- underlined -->
        <kbq-tab-group underlined data-testid="e2eTabsUnderlined" [useStateSaving]="false">
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
        <kbq-tab-group kbq-stretch-tabs [useStateSaving]="false" [activeTab]="tabs[2]">
            @for (tab of tabs.slice(0, 2); track tab) {
                <kbq-tab [disabled]="$first" [tabId]="tab" [label]="tab">Active tab is {{ tab }}</kbq-tab>
            }
        </kbq-tab-group>

        <!-- underlined with text and icon states -->
        <kbq-tab-group underlined data-testid="e2eTabsUnderlinedTextIcon" [useStateSaving]="false">
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
        <kbq-tab-group kbq-stretch-tabs [useStateSaving]="false">
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
        <kbq-tab-group kbq-stretch-tabs underlined [useStateSaving]="false">
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
        <kbq-tab-group
            underlined
            data-testid="e2eTabsUnderlinedTextIconDisabled"
            [useStateSaving]="false"
            [onSurface]="true"
        >
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
        <kbq-tab-group vertical [useStateSaving]="false" [style.height.px]="100">
            @for (tab of tabs; track tab) {
                <kbq-tab [disabled]="$index === 1" [tabId]="tab" [label]="tab">Active tab is {{ tab }}</kbq-tab>
            }
        </kbq-tab-group>

        <!-- vertical with icons -->
        <kbq-tab-group vertical [useStateSaving]="false" [style.height.px]="100" [activeTab]="tabs[2]">
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
        <kbq-tab-group
            vertical
            data-testid="e2eTabsVerticalIconsOnly"
            [useStateSaving]="false"
            [style.height.px]="130"
            [activeTab]="tabs[2]"
        >
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
        <kbq-tab-group [useStateSaving]="false" [onSurface]="true">
            @for (tab of tabs.slice(0, 2); track tab) {
                <kbq-tab [tabId]="tab" [disabled]="$index === 1" [label]="tab">Active tab is {{ tab }}</kbq-tab>
            }
        </kbq-tab-group>

        <!-- base with icons on-surface -->
        <kbq-tab-group [useStateSaving]="false" [onSurface]="true" [activeTab]="tabs[5]">
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
        <kbq-tab-group underlined [useStateSaving]="false" [onSurface]="true">
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
        <kbq-tab-group vertical [useStateSaving]="false" [onSurface]="true" [style.height.px]="100">
            @for (tab of tabs; track tab) {
                <kbq-tab [disabled]="$index === 1" [tabId]="tab" [label]="tab">Active tab is {{ tab }}</kbq-tab>
            }
        </kbq-tab-group>
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
        // Registered separately rather than as one callback: an index that drifts out of range throws,
        // and a shared callback would let that failure silently skip every setup after it — which is
        // how a stale index once emptied two groups' states without any test noticing.
        afterNextRender(() => this.setupTabsUnderlinedIconsOnlyStates());
        afterNextRender(() => this.setupTabsUnderlinedTextIconStates());
        afterNextRender(() => this.setupTabsVerticalIconsOnlyStates());
    }

    private setupTabsUnderlinedIconsOnlyStates(): void {
        const setState = e2eTabLabelStateSetter('e2eTabsUnderlinedIconsOnly');

        setState(0, 'kbq-hover', 'cdk-keyboard-focused');
        setState(1, 'kbq-hover');
        setState(2, 'kbq-hover', 'cdk-keyboard-focused');
        setState(4, 'cdk-keyboard-focused');
    }

    private setupTabsUnderlinedTextIconStates(): void {
        const setState = e2eTabLabelStateSetter('e2eTabsUnderlinedTextIcon');

        // The focused state goes on the group's last, disabled tab: a fifth tab to carry it on its own
        // would push the group past the 400px grid column and clip its focus ring out of the shot.
        setState(0, 'kbq-hover', 'cdk-keyboard-focused');
        setState(1, 'kbq-hover');
        setState(2, 'kbq-hover', 'cdk-keyboard-focused');
        setState(3, 'cdk-keyboard-focused');
    }

    private setupTabsVerticalIconsOnlyStates(): void {
        const setState = e2eTabLabelStateSetter('e2eTabsVerticalIconsOnly');

        setState(0, 'cdk-keyboard-focused');
        setState(2, 'cdk-keyboard-focused');
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

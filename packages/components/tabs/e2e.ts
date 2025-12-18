import { ChangeDetectionStrategy, Component } from '@angular/core';
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
        <kbq-tab-group underlined>
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
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
            width: 400px;
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
}

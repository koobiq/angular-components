import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs with scroll
 */
@Component({
    selector: 'tabs-with-scroll-example',
    imports: [KbqTabsModule],
    template: `
        <div class="tabs-with-scroll-example">
            <kbq-tab-group>
                @for (tab of tabs; track tab) {
                    <kbq-tab [label]="tab" />
                }
            </kbq-tab-group>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsWithScrollExample {
    readonly tabs = [
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
    ];
}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs with scroll vertical
 */
@Component({
    selector: 'tabs-with-scroll-vertical-example',
    imports: [KbqTabsModule],
    template: `
        <div class="example-tabs-with-scroll-vertical">
            <kbq-tab-group vertical>
                @for (tab of tabs; track tab) {
                    <kbq-tab [label]="tab">{{ tab }} tab content</kbq-tab>
                }
            </kbq-tab-group>
        </div>
    `,
    styleUrls: ['tabs-with-scroll-vertical-example.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsWithScrollVerticalExample {
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

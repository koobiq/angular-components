import { ChangeDetectionStrategy, Component, computed, ViewEncapsulation } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { injectExampleText } from './l10n';

/**
 * @title Tabs with scroll vertical
 */
@Component({
    selector: 'tabs-with-scroll-vertical-example',
    imports: [KbqTabsModule],
    template: `
        <div class="example-tabs-with-scroll-vertical">
            <kbq-tab-group vertical>
                @for (tab of tabs(); track tab) {
                    <kbq-tab [label]="tab">{{ text().tabContent(tab) }}</kbq-tab>
                }
            </kbq-tab-group>
        </div>
    `,
    styleUrls: ['tabs-with-scroll-vertical-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TabsWithScrollVerticalExample {
    protected readonly text = injectExampleText();

    readonly tabs = computed(() => [
        this.text().bruteforce,
        this.text().complexAttack,
        this.text().ddos,
        this.text().hipsAlert,
        this.text().idsIpsAlert,
        this.text().zeroDay,
        this.text().xss,
        this.text().malware,
        'Ransomware',
        'Phishing'
    ]);
}

import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { injectExampleText } from './l10n';

/**
 * @title Tabs with scroll
 */
@Component({
    selector: 'tabs-with-scroll-example',
    imports: [KbqTabsModule],
    template: `
        <div class="tabs-with-scroll-example">
            <kbq-tab-group>
                @for (tab of tabs(); track tab) {
                    <kbq-tab [label]="tab" />
                }
            </kbq-tab-group>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsWithScrollExample {
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

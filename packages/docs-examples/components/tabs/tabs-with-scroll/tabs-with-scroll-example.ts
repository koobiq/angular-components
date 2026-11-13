import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly tabs = computed(() => [
        this.t().bruteforce,
        this.t().complexAttack,
        this.t().ddos,
        this.t().hipsAlert,
        this.t().idsIpsAlert,
        this.t().zeroDay,
        this.t().xss,
        this.t().malware,
        'Ransomware',
        'Phishing'
    ]);
}

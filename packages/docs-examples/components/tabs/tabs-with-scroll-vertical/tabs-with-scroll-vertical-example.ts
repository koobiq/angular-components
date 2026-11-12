import { ChangeDetectionStrategy, Component, computed, ViewEncapsulation } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

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
                    <kbq-tab [label]="tab">{{ t().tabContent(tab) }}</kbq-tab>
                }
            </kbq-tab-group>
        </div>
    `,
    styleUrls: ['tabs-with-scroll-vertical-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TabsWithScrollVerticalExample extends BaseLocalizedExample<ExampleTranslation> {
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

    constructor() {
        super(TRANSLATIONS);
    }
}

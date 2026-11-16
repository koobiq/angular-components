import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Tabs overview
 */
@Component({
    selector: 'tabs-overview-example',
    imports: [KbqTabsModule],
    template: `
        <kbq-tab-group>
            <kbq-tab [label]="t().bruteforce">{{ t().tabContent(t().bruteforce) }}</kbq-tab>
            /kbq-tab>
            <kbq-tab [label]="t().complexAttack">{{ t().tabContent(t().complexAttack) }}</kbq-tab>
            /kbq-tab>
            <kbq-tab [label]="t().ddos">{{ t().tabContent(t().ddos) }}</kbq-tab>
            /kbq-tab>
            <kbq-tab [label]="t().dos">{{ t().tabContent(t().dos) }}</kbq-tab>
            /kbq-tab>
        </kbq-tab-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}

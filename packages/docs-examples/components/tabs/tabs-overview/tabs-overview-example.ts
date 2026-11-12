import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

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
export class TabsOverviewExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}

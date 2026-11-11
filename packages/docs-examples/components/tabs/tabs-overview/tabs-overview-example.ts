import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { injectExampleText } from '../l10n';

/**
 * @title Tabs overview
 */
@Component({
    selector: 'tabs-overview-example',
    imports: [KbqTabsModule],
    template: `
        <kbq-tab-group>
            <kbq-tab [label]="text().bruteforce">{{ text().tabContent(text().bruteforce) }}</kbq-tab>
            /kbq-tab>
            <kbq-tab [label]="text().complexAttack">{{ text().tabContent(text().complexAttack) }}</kbq-tab>
            /kbq-tab>
            <kbq-tab [label]="text().ddos">{{ text().tabContent(text().ddos) }}</kbq-tab>
            /kbq-tab>
            <kbq-tab [label]="text().dos">{{ text().tabContent(text().dos) }}</kbq-tab>
            /kbq-tab>
        </kbq-tab-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsOverviewExample {
    protected readonly text = injectExampleText();
}

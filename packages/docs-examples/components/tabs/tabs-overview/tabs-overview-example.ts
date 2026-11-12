import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

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
export class TabsOverviewExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}

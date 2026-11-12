import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Tabs stretch
 */
@Component({
    selector: 'tabs-stretch-example',
    imports: [KbqTabsModule],
    template: `
        <kbq-tab-group kbq-stretch-tabs>
            <kbq-tab [label]="t().bruteforce" />
            <kbq-tab label="Identity Theft" />
            <kbq-tab label="Spam Attack" />
        </kbq-tab-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsStretchExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}

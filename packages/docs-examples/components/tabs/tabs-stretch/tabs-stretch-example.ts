import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
export class TabsStretchExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}

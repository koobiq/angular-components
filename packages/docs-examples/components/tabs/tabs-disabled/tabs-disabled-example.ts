import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Tabs disabled
 */
@Component({
    selector: 'tabs-disabled-example',
    imports: [KbqTabsModule],
    template: `
        <kbq-tab-group class="layout-margin-bottom-m">
            <kbq-tab [label]="t().bruteforce" />
            <kbq-tab disabled [label]="t().complexAttack" />
            <kbq-tab disabled [label]="t().ddos" />
            <kbq-tab [label]="t().dos" />
        </kbq-tab-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsDisabledExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}

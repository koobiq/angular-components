import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { injectExampleText } from '../l10n';

/**
 * @title Tabs disabled
 */
@Component({
    selector: 'tabs-disabled-example',
    imports: [KbqTabsModule],
    template: `
        <kbq-tab-group class="layout-margin-bottom-m">
            <kbq-tab [label]="text().bruteforce" />
            <kbq-tab disabled [label]="text().complexAttack" />
            <kbq-tab disabled [label]="text().ddos" />
            <kbq-tab [label]="text().dos" />
        </kbq-tab-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsDisabledExample {
    protected readonly text = injectExampleText();
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

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
export class TabsDisabledExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}

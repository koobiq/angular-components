import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { injectExampleText } from '../l10n';

/**
 * @title Tabs stretch
 */
@Component({
    selector: 'tabs-stretch-example',
    imports: [KbqTabsModule],
    template: `
        <kbq-tab-group kbq-stretch-tabs>
            <kbq-tab [label]="text().bruteforce" />
            <kbq-tab label="Identity Theft" />
            <kbq-tab label="Spam Attack" />
        </kbq-tab-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsStretchExample {
    protected readonly text = injectExampleText();
}

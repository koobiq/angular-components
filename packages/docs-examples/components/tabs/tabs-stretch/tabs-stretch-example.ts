import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs stretch
 */
@Component({
    selector: 'tabs-stretch-example',
    imports: [KbqTabsModule],
    template: `
        <kbq-tab-group kbq-stretch-tabs>
            <kbq-tab label="BruteForce" />
            <kbq-tab label="Identity Theft" />
            <kbq-tab label="Spam Attack" />
        </kbq-tab-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsStretchExample {}

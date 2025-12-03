import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs overview
 */
@Component({
    selector: 'tabs-overview-example',
    imports: [KbqTabsModule],
    template: `
        <kbq-tab-group>
            <kbq-tab label="BruteForce">BruteForce tab content</kbq-tab>
            <kbq-tab label="Complex attack">Complex attack tab content</kbq-tab>
            <kbq-tab label="DDoS">DDoS tab content</kbq-tab>
            <kbq-tab label="DoS">DoS tab content</kbq-tab>
        </kbq-tab-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsOverviewExample {}

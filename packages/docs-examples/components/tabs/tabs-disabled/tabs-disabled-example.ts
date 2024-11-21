import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs disabled
 */
@Component({
    standalone: true,
    selector: 'tabs-disabled-example',
    imports: [KbqTabsModule],
    template: `
        <kbq-tab-group class="layout-margin-bottom-m">
            <kbq-tab label="BruteForce" />
            <kbq-tab
                label="Complex attack"
                disabled
            />
            <kbq-tab
                label="DDoS"
                disabled
            />
            <kbq-tab label="DoS" />
        </kbq-tab-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsDisabledExample {}

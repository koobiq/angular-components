import { Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs overview
 */
@Component({
    standalone: true,
    selector: 'tabs-overview-example',
    imports: [
        KbqTabsModule
    ],
    template: `
        <kbq-tab-group>
            <kbq-tab [label]="'Bruteforce'" />
            <kbq-tab [label]="'Complex Attack'" />
            <kbq-tab [label]="'DDoS'" />
            <kbq-tab [label]="'DoS'" />
        </kbq-tab-group>
    `
})
export class TabsOverviewExample {}

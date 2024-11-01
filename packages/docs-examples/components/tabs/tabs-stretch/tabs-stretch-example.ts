import { Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs stretch
 */
@Component({
    standalone: true,
    selector: 'tabs-stretch-example',
    imports: [
        KbqTabsModule
    ],
    template: `
        <kbq-tab-group kbq-stretch-tabs>
            <kbq-tab [label]="'Bruteforce'" />
            <kbq-tab [label]="'Identity Theft'" />
            <kbq-tab [label]="'Spam Attack'" />
        </kbq-tab-group>
    `
})
export class TabsStretchExample {}

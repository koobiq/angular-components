import { Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs with scroll vertical
 */
@Component({
    standalone: true,
    selector: 'tabs-with-scroll-vertical-example',
    styleUrl: 'tabs-with-scroll-vertical-example.css',
    imports: [KbqTabsModule],
    template: `
        <div class="tabs-with-scroll-vertical-example">
            <kbq-tab-group vertical>
                <kbq-tab [label]="'Bruteforce'" />
                <kbq-tab [label]="'Complex Attack'" />
                <kbq-tab [label]="'DDoS'" />
                <kbq-tab [label]="'DoS'" />
                <kbq-tab [label]="'HIPS Alert'" />
                <kbq-tab [label]="'IDS/IPS Alert'" />
                <kbq-tab [label]="'Bruteforce'" />
                <kbq-tab [label]="'Complex Attack'" />
                <kbq-tab [label]="'DDoS'" />
                <kbq-tab [label]="'DoS'" />
                <kbq-tab [label]="'HIPS Alert'" />
                <kbq-tab [label]="'IDS/IPS Alert'" />
            </kbq-tab-group>
        </div>
    `
})
export class TabsWithScrollVerticalExample {}

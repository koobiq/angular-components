import { Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs disabled
 */
@Component({
    standalone: true,
    selector: 'tabs-disabled-example',
    styleUrl: 'tabs-disabled-example.css',
    imports: [
        KbqTabsModule
    ],
    template: `
        <div class="tabs-disabled-example">
            <kbq-tab-group>
                <kbq-tab [label]="'Bruteforce'" />
                <kbq-tab
                    [disabled]="true"
                    [label]="'Complex Attack'"
                />
                <kbq-tab [label]="'DDoS'" />
                <kbq-tab [label]="'DoS'" />
            </kbq-tab-group>

            <kbq-tab-group>
                <kbq-tab
                    [disabled]="true"
                    [label]="'Bruteforce'"
                />
                <kbq-tab
                    [disabled]="true"
                    [label]="'Complex Attack'"
                />
                <kbq-tab
                    [disabled]="true"
                    [label]="'DDoS'"
                />
                <kbq-tab
                    [disabled]="true"
                    [label]="'DoS'"
                />
            </kbq-tab-group>
        </div>
    `
})
export class TabsDisabledExample {}

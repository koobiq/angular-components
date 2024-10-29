import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs actionbar
 */
@Component({
    standalone: true,
    selector: 'tabs-actionbar-example',
    templateUrl: 'tabs-actionbar-example.html',
    styleUrl: 'tabs-actionbar-example.css',
    imports: [
        KbqTabsModule,
        KbqButtonModule,
        KbqIcon
    ]
})
export class TabsActionbarExample {}

import { Component } from '@angular/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs custom
 */
@Component({
    standalone: true,
    selector: 'tabs-custom-example',
    templateUrl: 'tabs-custom-example.html',
    styleUrl: 'tabs-custom-example.css',
    imports: [
        KbqTabsModule,
        KbqIcon
    ]
})
export class TabsCustomExample {}

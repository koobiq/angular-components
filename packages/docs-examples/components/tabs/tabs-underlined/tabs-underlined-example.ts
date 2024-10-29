import { Component } from '@angular/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs underlined
 */
@Component({
    standalone: true,
    selector: 'tabs-underlined-example',
    styleUrl: 'tabs-underlined-example.css',
    templateUrl: 'tabs-underlined-example.html',
    imports: [
        KbqTabsModule,
        KbqIcon
    ]
})
export class TabsUnderlinedExample {}

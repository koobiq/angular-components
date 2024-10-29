import { Component } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs vertical
 */
@Component({
    standalone: true,
    selector: 'tabs-vertical-example',
    styleUrl: 'tabs-vertical-example.css',
    templateUrl: 'tabs-vertical-example.html',
    imports: [
        KbqTabsModule,
        KbqIcon
    ]
})
export class TabsVerticalExample {
    protected readonly PopUpPlacements = PopUpPlacements;
}

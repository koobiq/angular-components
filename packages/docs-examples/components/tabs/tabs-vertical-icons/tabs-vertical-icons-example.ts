import { Component } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs vertical icons
 */
@Component({
    standalone: true,
    selector: 'tabs-vertical-icons-example',
    styleUrl: 'tabs-vertical-icons-example.css',
    templateUrl: 'tabs-vertical-icons-example.html',
    imports: [
        KbqTabsModule,
        KbqIcon
    ]
})
export class TabsVerticalIconsExample {
    protected readonly PopUpPlacements = PopUpPlacements;
}

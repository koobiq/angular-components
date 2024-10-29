import { Component } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs empty
 */
@Component({
    standalone: true,
    selector: 'tabs-empty-example',
    styleUrl: 'tabs-empty-example.css',
    templateUrl: 'tabs-empty-example.html',
    imports: [
        KbqTabsModule
    ]
})
export class TabsEmptyExample {
    protected readonly PopUpPlacements = PopUpPlacements;
}

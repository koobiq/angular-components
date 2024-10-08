import { Component, ViewEncapsulation } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';

/**
 * @title Tabs vertical icons
 */
@Component({
    selector: 'tabs-vertical-icons-example',
    templateUrl: 'tabs-vertical-icons-example.html',
    styleUrls: ['tabs-vertical-icons-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TabsVerticalIconsExample {
    protected readonly PopUpPlacements = PopUpPlacements;
}

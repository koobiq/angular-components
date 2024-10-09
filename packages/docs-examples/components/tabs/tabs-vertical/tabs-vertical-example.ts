import { Component, ViewEncapsulation } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';

/**
 * @title Tabs vertical
 */
@Component({
    selector: 'tabs-vertical-example',
    templateUrl: 'tabs-vertical-example.html',
    styleUrls: ['tabs-vertical-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TabsVerticalExample {
    protected readonly PopUpPlacements = PopUpPlacements;
}

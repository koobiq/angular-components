import { Component, ViewEncapsulation } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';

/**
 * @title Tabs empty
 */
@Component({
    selector: 'tabs-empty-example',
    templateUrl: 'tabs-empty-example.html',
    styleUrls: ['tabs-empty-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TabsEmptyExample {
    protected readonly PopUpPlacements = PopUpPlacements;
}

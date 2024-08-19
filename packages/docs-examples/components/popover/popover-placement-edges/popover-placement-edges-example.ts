import { Component, ViewEncapsulation } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';

/**
 * @title popover-placement-edges
 */
@Component({
    selector: 'popover-placement-edges-example',
    templateUrl: 'popover-placement-edges-example.html',
    styleUrls: ['popover-placement-edges-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class PopoverPlacementEdgesExample {
    placements = PopUpPlacements;
}

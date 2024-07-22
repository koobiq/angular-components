import { Component, ViewEncapsulation } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';

/**
 * @title popover-placement-center
 */
@Component({
    selector: 'popover-placement-center-example',
    templateUrl: 'popover-placement-center-example.html',
    styleUrls: ['popover-placement-center-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class PopoverPlacementCenterExample {
    placements = [PopUpPlacements.Top, PopUpPlacements.Right, PopUpPlacements.Bottom, PopUpPlacements.Left];
    activePlacement: PopUpPlacements | null;
}

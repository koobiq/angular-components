import { Component, ViewEncapsulation } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';

/**
 * @title tooltip-placement-center
 */
@Component({
    selector: 'tooltip-placement-center-example',
    templateUrl: 'tooltip-placement-center-example.html',
    styleUrls: ['tooltip-placement-center-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class TooltipPlacementCenterExample {
    placements = [PopUpPlacements.Top, PopUpPlacements.Right, PopUpPlacements.Bottom, PopUpPlacements.Left];
}

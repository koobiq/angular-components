import { Component, ViewEncapsulation } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';


/**
 * @title tooltip-placement-edges
 */
@Component({
    selector: 'tooltip-placement-edges-example',
    templateUrl: 'tooltip-placement-edges-example.html',
    styleUrls: ['tooltip-placement-edges-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TooltipPlacementEdgesExample {
    placements = [PopUpPlacements.TopLeft, PopUpPlacements.TopRight, PopUpPlacements.BottomLeft, PopUpPlacements.BottomRight,
        PopUpPlacements.LeftBottom, PopUpPlacements.LeftTop, PopUpPlacements.RightBottom, PopUpPlacements.RightTop];
}

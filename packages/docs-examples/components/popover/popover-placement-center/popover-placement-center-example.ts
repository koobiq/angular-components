import { Component, ViewEncapsulation } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqPopoverTrigger } from '@koobiq/components/popover';

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
    placements = PopUpPlacements;
    activePopover: KbqPopoverTrigger;
}

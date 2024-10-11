import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors } from '@koobiq/components/badge';
import { PopUpPlacements } from '@koobiq/components/core';

/**
 * @title Badge tooltip
 */
@Component({
    selector: 'badge-tooltip-example',
    templateUrl: 'badge-tooltip-example.html',
    styleUrls: ['badge-tooltip-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class BadgeTooltipExample {
    colors = KbqBadgeColors;
    protected readonly PopUpPlacements = PopUpPlacements;
}

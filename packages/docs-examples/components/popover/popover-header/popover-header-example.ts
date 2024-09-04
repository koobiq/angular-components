import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors } from '@koobiq/components/badge';

/**
 * @title popover-header
 */
@Component({
    selector: 'popover-header-example',
    templateUrl: 'popover-header-example.html',
    styleUrls: ['popover-header-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class PopoverHeaderExample {
    badgeColors = KbqBadgeColors;
}

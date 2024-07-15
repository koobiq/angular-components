import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors } from '@koobiq/components/badge';

/**
 * @title Badge
 */
@Component({
    selector: 'badge-overview-example',
    templateUrl: 'badge-overview-example.html',
    styleUrls: ['badge-overview-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class BadgeOverviewExample {
    colors = KbqBadgeColors;
}

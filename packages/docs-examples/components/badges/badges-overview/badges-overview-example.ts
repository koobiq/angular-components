import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors } from '@koobiq/components/badge';


/**
 * @title Badges
 */
@Component({
    selector: 'badges-overview-example',
    templateUrl: 'badges-overview-example.html',
    styleUrls: ['badges-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class BadgesOverviewExample {
    colors = KbqBadgeColors;
}

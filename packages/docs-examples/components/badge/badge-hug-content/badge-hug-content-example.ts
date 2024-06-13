import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors } from '@koobiq/components/badge';


/**
 * @title Corner Cases
 */
@Component({
    selector: 'badge-hug-content-example',
    templateUrl: 'badge-hug-content-example.html',
    styleUrls: ['badge-hug-content-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class BadgeHugContentExample {
    colors = KbqBadgeColors;
}

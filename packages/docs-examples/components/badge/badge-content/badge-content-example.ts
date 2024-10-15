import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors } from '@koobiq/components/badge';

/**
 * @title Badge content
 */
@Component({
    selector: 'badge-content-example',
    templateUrl: 'badge-content-example.html',
    styleUrls: ['badge-content-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class BadgeContentExample {
    colors = KbqBadgeColors;
}

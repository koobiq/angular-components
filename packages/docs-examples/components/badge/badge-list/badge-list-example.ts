import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors } from '@koobiq/components/badge';

/**
 * @title Badge list
 */
@Component({
    selector: 'badge-list-example',
    templateUrl: 'badge-list-example.html',
    styleUrls: ['badge-list-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class BadgeListExample {
    colors = KbqBadgeColors;
}

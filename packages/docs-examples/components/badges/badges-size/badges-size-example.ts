import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors } from '@koobiq/components/badge';


/**
 * @title Size
 */
@Component({
    selector: 'badges-size-example',
    templateUrl: 'badges-size-example.html',
    styleUrls: ['badges-size-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class BadgesSizeExample {
    colors = KbqBadgeColors;
}

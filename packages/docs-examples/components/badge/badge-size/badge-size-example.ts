import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors } from '@koobiq/components/badge';


/**
 * @title Size
 */
@Component({
    selector: 'badge-size-example',
    templateUrl: 'badge-size-example.html',
    styleUrls: ['badge-size-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class BadgeSizeExample {
    colors = KbqBadgeColors;
}

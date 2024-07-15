import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors } from '@koobiq/components/badge';

/**
 * @title Fill and Style
 */
@Component({
    selector: 'badge-fill-and-style-example',
    templateUrl: 'badge-fill-and-style-example.html',
    styleUrls: ['badge-fill-and-style-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class BadgeFillAndStyleExample {
    colors = KbqBadgeColors;
}

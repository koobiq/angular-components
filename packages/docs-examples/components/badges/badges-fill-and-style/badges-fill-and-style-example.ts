import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors } from '@koobiq/components/badge';


/**
 * @title Fill and Style
 */
@Component({
    selector: 'badges-fill-and-style-example',
    templateUrl: 'badges-fill-and-style-example.html',
    styleUrls: ['badges-fill-and-style-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class BadgesFillAndStyleExample {
    colors = KbqBadgeColors;
}

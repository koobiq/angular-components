import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors } from '@koobiq/components/badge';


/**
 * @title Content
 */
@Component({
    selector: 'badges-content-example',
    templateUrl: 'badges-content-example.html',
    styleUrls: ['badges-content-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class BadgesContentExample {
    colors = KbqBadgeColors;
}

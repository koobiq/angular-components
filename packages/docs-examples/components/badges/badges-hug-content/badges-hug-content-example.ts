import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors } from '@koobiq/components/badge';


/**
 * @title Corner Cases
 */
@Component({
    selector: 'badges-hug-content-example',
    templateUrl: 'badges-hug-content-example.html',
    styleUrls: ['badges-hug-content-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class BadgesHugContentExample {
    colors = KbqBadgeColors;
}

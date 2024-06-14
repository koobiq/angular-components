import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';


/**
 * @title Corner Cases
 */
@Component({
    selector: 'tag-hug-content-example',
    templateUrl: 'tag-hug-content-example.html',
    styleUrls: ['tag-hug-content-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TagHugContentExample {
    colors = KbqComponentColors;
}

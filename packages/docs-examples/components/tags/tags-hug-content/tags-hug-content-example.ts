import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';


/**
 * @title Corner Cases
 */
@Component({
    selector: 'tags-hug-content-example',
    templateUrl: 'tags-hug-content-example.html',
    styleUrls: ['tags-hug-content-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TagsHugContentExample {
    colors = KbqComponentColors;
}

import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';


/**
 * @title Content
 */
@Component({
    selector: 'tags-content-example',
    templateUrl: 'tags-content-example.html',
    styleUrls: ['tags-content-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TagsContentExample {
    colors = KbqComponentColors;
}

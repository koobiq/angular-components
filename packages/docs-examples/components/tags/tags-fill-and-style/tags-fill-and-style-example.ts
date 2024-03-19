import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';


/**
 * @title Fill and Style
 */
@Component({
    selector: 'tags-fill-and-style-example',
    templateUrl: 'tags-fill-and-style-example.html',
    styleUrls: ['tags-fill-and-style-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TagsFillAndStyleExample {
    colors = KbqComponentColors;
}

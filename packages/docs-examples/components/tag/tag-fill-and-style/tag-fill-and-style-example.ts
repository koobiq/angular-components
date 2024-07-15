import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Fill and Style
 */
@Component({
    selector: 'tag-fill-and-style-example',
    templateUrl: 'tag-fill-and-style-example.html',
    styleUrls: ['tag-fill-and-style-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class TagFillAndStyleExample {
    colors = KbqComponentColors;
}

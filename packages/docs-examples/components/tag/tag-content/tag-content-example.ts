import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Content
 */
@Component({
    selector: 'tag-content-example',
    templateUrl: 'tag-content-example.html',
    styleUrls: ['tag-content-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class TagContentExample {
    colors = KbqComponentColors;
}

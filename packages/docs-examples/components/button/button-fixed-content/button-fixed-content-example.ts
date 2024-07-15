import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button Fixed
 */
@Component({
    selector: 'button-fixed-content-example',
    templateUrl: 'button-fixed-content-example.html',
    styleUrls: ['button-fixed-content-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class ButtonFixedContentExample {
    colors = KbqComponentColors;
}

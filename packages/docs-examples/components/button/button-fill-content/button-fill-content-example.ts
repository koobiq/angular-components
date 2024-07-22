import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button Fill
 */
@Component({
    selector: 'button-fill-content-example',
    templateUrl: 'button-fill-content-example.html',
    styleUrls: ['button-fill-content-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ButtonFillContentExample {
    colors = KbqComponentColors;
}

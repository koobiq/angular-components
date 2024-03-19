import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';


/**
 * @title Button Hug
 */
@Component({
    selector: 'button-hug-content-example',
    templateUrl: 'button-hug-content-example.html',
    styleUrls: ['button-hug-content-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ButtonHugContentExample {
    colors = KbqComponentColors;
}

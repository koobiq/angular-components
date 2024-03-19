import { Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';


/**
 * @title Fill and Style
 */
@Component({
    selector: 'button-fill-and-style-example',
    templateUrl: 'button-fill-and-style-example.html',
    styleUrls: ['button-fill-and-style-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ButtonFillAndStyleExample {
    colors = KbqComponentColors;
    styles = KbqButtonStyles;
}

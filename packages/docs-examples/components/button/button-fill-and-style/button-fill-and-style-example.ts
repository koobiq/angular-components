import { Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button fill and style
 */
@Component({
    standalone: true,
    selector: 'button-fill-and-style-example',
    templateUrl: 'button-fill-and-style-example.html',
    styleUrl: 'button-fill-and-style-example.css',
    imports: [
        KbqButtonModule
    ],
    encapsulation: ViewEncapsulation.None
})
export class ButtonFillAndStyleExample {
    colors = KbqComponentColors;
    styles = KbqButtonStyles;
}

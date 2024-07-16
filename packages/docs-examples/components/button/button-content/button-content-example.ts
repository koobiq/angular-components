import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Content
 */
@Component({
    selector: 'button-content-example',
    templateUrl: 'button-content-example.html',
    styleUrls: ['button-content-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ButtonContentExample {
    colors = KbqComponentColors;
}

import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';


/**
 * @title Button Loading State
 */
@Component({
    selector: 'button-loading-state-example',
    templateUrl: 'button-loading-state-example.html',
    styleUrls: ['button-loading-state-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ButtonLoadingStateExample {
    colors = KbqComponentColors;
}

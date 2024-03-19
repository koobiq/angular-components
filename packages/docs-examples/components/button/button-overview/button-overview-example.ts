import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';


/**
 * @title Basic button
 */
@Component({
    selector: 'button-overview-example',
    templateUrl: 'button-overview-example.html',
    styleUrls: ['button-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ButtonOverviewExample {
    colors = KbqComponentColors;
    isDisabled = false;
    hasProgress = false;
}

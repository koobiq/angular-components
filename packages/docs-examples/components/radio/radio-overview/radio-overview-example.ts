import { Component, ViewEncapsulation } from '@angular/core';

/**
 * @title Basic radio
 */
@Component({
    selector: 'radio-overview-example',
    templateUrl: 'radio-overview-example.html',
    styleUrls: ['radio-overview-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class RadioOverviewExample {
    isDisabled = false;
}

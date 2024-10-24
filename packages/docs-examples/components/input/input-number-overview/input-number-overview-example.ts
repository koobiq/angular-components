import { Component, ViewEncapsulation } from '@angular/core';

/**
 * @title Basic Input
 */
@Component({
    selector: 'input-number-overview-example',
    templateUrl: 'input-number-overview-example.html',
    styleUrls: ['input-number-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class InputNumberOverviewExample {
    value = '';
    integerValue = '';
}

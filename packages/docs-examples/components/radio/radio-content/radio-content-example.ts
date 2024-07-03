import { Component, ViewEncapsulation } from '@angular/core';


/**
 * @title Radio content
 */
@Component({
    selector: 'radio-content-example',
    templateUrl: 'radio-content-example.html',
    styleUrls: ['radio-content-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class RadioContentExample {
    isDisabled = false;
}

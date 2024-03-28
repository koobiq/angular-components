import { Component, ViewEncapsulation } from '@angular/core';


/**
 * @title Basic Select
 */
@Component({
    selector: 'select-multiple-overview-example',
    templateUrl: 'select-multiple-overview-example.html',
    styleUrls: ['select-multiple-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class SelectMultipleOverviewExample {
    selected = [];
}

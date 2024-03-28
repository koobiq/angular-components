import { Component, ViewEncapsulation } from '@angular/core';


/**
 * @title Basic Select
 */
@Component({
    selector: 'select-overview-example',
    templateUrl: 'select-overview-example.html',
    styleUrls: ['select-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class SelectOverviewExample {
    selected = '';
}

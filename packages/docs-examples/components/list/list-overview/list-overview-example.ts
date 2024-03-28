import { Component, ViewEncapsulation } from '@angular/core';


/**
 * @title Basic list
 */
@Component({
    selector: 'list-overview-example',
    templateUrl: 'list-overview-example.html',
    styleUrls: ['list-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ListOverviewExample {
    selected = [];
}

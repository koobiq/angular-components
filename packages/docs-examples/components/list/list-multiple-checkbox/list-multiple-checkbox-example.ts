import { Component, ViewEncapsulation } from '@angular/core';

/**
 * @title Basic list
 */
@Component({
    selector: 'list-multiple-checkbox-example',
    templateUrl: 'list-multiple-checkbox-example.html',
    styleUrls: ['list-multiple-checkbox-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ListMultipleCheckboxExample {
    selected = [];
}

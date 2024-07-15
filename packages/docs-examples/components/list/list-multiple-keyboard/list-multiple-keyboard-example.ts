import { Component, ViewEncapsulation } from '@angular/core';

/**
 * @title Basic list
 */
@Component({
    selector: 'list-multiple-keyboard-example',
    templateUrl: 'list-multiple-keyboard-example.html',
    styleUrls: ['list-multiple-keyboard-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class ListMultipleKeyboardExample {
    selected = [];
}

/* tslint:disable:no-magic-numbers */
/* tslint:disable-next-line:match-default-export-name */
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

/**
 * @title multilingual datepicker
 */
@Component({
    selector: 'datepicker-language-example',
    templateUrl: 'datepicker-language-example.html',
    styleUrls: ['datepicker-language-example.css'],
})
export class DatepickerLanguageExample {
    selectedDate: FormControl;

    constructor() {
        this.selectedDate = new FormControl(null);
    }
}

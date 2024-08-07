import { Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

/**
 * @title validation-global
 */
@Component({
    selector: 'validation-global-one-required-example',
    templateUrl: 'validation-global-one-required-example.html',
    styleUrls: ['validation-global-one-required-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ValidationGlobalOneRequiredExample {
    globalErrorForm: FormGroup;
    showServerErrors = false;

    inProgress = false;
    disabled = false;
    showError = false;

    constructor() {
        this.globalErrorForm = new FormGroup({
            firstName: new FormControl(''),
            lastName: new FormControl(''),
            thirdName: new FormControl('')
        });
    }

    submitGlobalErrorForm() {
        this.showServerErrors = false;
        this.inProgress = true;

        setTimeout(() => {
            this.showServerErrors = true;
            this.inProgress = false;
        }, 1000);
    }

    checkForm() {
        this.inProgress = true;

        setTimeout(() => {
            this.inProgress = false;
            this.showError = true;
            this.disabled = true;
        }, 2000);
    }
}

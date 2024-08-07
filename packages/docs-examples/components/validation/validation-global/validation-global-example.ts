import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

/**
 * @title validation-global
 */
@Component({
    selector: 'validation-global-example',
    templateUrl: 'validation-global-example.html',
    styleUrls: ['validation-global-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ValidationGlobalExample {
    @ViewChild('submitButton') submitButton: ElementRef;

    globalErrorForm: FormGroup;
    showServerErrors: boolean = false;
    inProgress: boolean = false;

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
            this.submitButton.nativeElement.focus();
        }, 1000);
    }
}

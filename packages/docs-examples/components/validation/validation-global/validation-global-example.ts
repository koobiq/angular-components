import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Validation global
 */
@Component({
    standalone: true,
    selector: 'validation-global-example',
    templateUrl: 'validation-global-example.html',
    imports: [
        KbqAlertModule,
        KbqIconModule,
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqButtonModule,
        KbqFormsModule
    ],
    styles: `
        .docs-width {
            max-width: 480px;
        }

        :host ::ng-deep .kbq-alert {
            margin-bottom: 16px;
        }

        button {
            margin-bottom: 16px;
        }
    `
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

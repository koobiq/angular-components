import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTextareaModule } from '@koobiq/components/textarea';

/**
 * @title Validation
 */
@Component({
    standalone: true,
    selector: 'validation-overview-example',
    templateUrl: 'validation-overview-example.html',
    imports: [
        ReactiveFormsModule,
        KbqInputModule,
        KbqTextareaModule,
        KbqSelectModule,
        KbqButtonModule,
        KbqFormsModule,
        KbqFormFieldModule
    ]
})
export class ValidationOverviewExample {
    feedbackForm: FormGroup;
    feedbackFormWithHints: FormGroup;

    constructor() {
        this.feedbackFormWithHints = new FormGroup({
            firstName: new FormControl('', [Validators.required]),
            lastName: new FormControl('', [Validators.required]),
            thirdName: new FormControl(''),
            email: new FormControl('', [Validators.required, Validators.email]),
            reason: new FormControl('', [Validators.required]),
            rating: new FormControl('', [Validators.required]),
            comment: new FormControl('')
        });

        this.feedbackForm = new FormGroup({
            firstName: new FormControl('', [Validators.required]),
            lastName: new FormControl('', [Validators.required]),
            thirdName: new FormControl(''),
            email: new FormControl('', [Validators.required, Validators.email]),
            reason: new FormControl('', [Validators.required]),
            rating: new FormControl('', [Validators.required]),
            comment: new FormControl('')
        });
    }
}

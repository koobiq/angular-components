import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { kbqErrorStateMatcherProvider, ShowOnFormSubmitErrorStateMatcher } from '@koobiq/components/core';
import { KbqFileItem, KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';

/**
 * @title File Upload Single Required Reactive Validation Example
 */
@Component({
    standalone: true,
    selector: 'file-upload-single-required-reactive-validation-example',
    template: `
        <form [formGroup]="formMultiple" (ngSubmit)="onSubmit()">
            <button class="layout-margin-bottom-m" kbq-button type="submit">Submit</button>

            <kbq-file-upload
                class="layout-margin-bottom-s"
                #kbqFileUpload
                [progressMode]="'indeterminate'"
                formControlName="fileUpload"
            >
                <ng-template #kbqFileIcon>
                    <i color="contrast-fade" kbq-icon="kbq-file-o_16"></i>
                </ng-template>
                @if (formMultiple.controls.fileUpload.hasError('required') && kbqFileUpload.errorState) {
                    <kbq-hint color="error">File required</kbq-hint>
                }
            </kbq-file-upload>
        </form>
    `,
    imports: [
        KbqFileUploadModule,
        KbqFormFieldModule,
        FormsModule,
        KbqButtonModule,
        KbqIcon,
        ReactiveFormsModule
    ],
    providers: [kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher)]
})
export class FileUploadSingleRequiredReactiveValidationExample {
    formMultiple = new FormGroup(
        {
            fileUpload: new FormControl<KbqFileItem | null>(null, Validators.required)
        },
        { updateOn: 'submit' }
    );

    onSubmit() {
        console.log('perform action on submit');
    }
}

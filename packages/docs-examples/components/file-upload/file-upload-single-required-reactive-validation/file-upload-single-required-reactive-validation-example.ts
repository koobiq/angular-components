import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { kbqErrorStateMatcherProvider, ShowOnFormSubmitErrorStateMatcher } from '@koobiq/components/core';
import { KbqFileItem, KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title File Upload Single Required Reactive Validation Example
 */
@Component({
    standalone: true,
    selector: 'file-upload-single-required-reactive-validation-example',
    template: `
        <form [formGroup]="formMultiple" (ngSubmit)="onSubmit()">
            <kbq-file-upload
                #kbqFileUpload
                class="layout-margin-bottom-s"
                formControlName="fileUpload"
                [progressMode]="'indeterminate'"
            >
                <i kbq-icon="kbq-file-o_16"></i>
                @if (formMultiple.controls.fileUpload.invalid && kbqFileUpload.invalid) {
                    <kbq-hint color="error">File required</kbq-hint>
                }
            </kbq-file-upload>
            <button class="layout-margin-top-m" kbq-button type="submit">Submit</button>
        </form>
    `,
    imports: [
        ReactiveFormsModule,
        KbqFileUploadModule,
        KbqFormFieldModule,
        KbqButtonModule,
        KbqIconModule
    ],
    providers: [kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher)],
    changeDetection: ChangeDetectionStrategy.OnPush
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

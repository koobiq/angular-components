import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { ShowOnFormSubmitErrorStateMatcher } from '@koobiq/components/core';
import { KbqFileItem, KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title File upload multiple required reactive validation example
 */
@Component({
    selector: 'file-upload-multiple-required-reactive-validation-example',
    imports: [
        ReactiveFormsModule,
        KbqFileUploadModule,
        KbqFormFieldModule,
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <form [formGroup]="formMultiple" (ngSubmit)="onSubmit()">
            <kbq-file-upload
                #kbqFileUpload
                class="layout-margin-bottom-s"
                formControlName="fileUpload"
                multiple
                [errorStateMatcher]="customErrorStateMatcher"
                [progressMode]="'indeterminate'"
            >
                <ng-template #kbqFileIcon>
                    <i kbq-icon="kbq-file-o_16"></i>
                </ng-template>
                @if (kbqFileUpload.invalid && formMultiple.controls.fileUpload.hasError('required')) {
                    <kbq-hint color="error">File required</kbq-hint>
                }
                @if (kbqFileUpload.invalid && formMultiple.controls.fileUpload.hasError('minlength')) {
                    @let minLengthError = formMultiple.controls.fileUpload.getError('minlength');
                    <kbq-hint color="error">
                        {{ minLengthError.actualLength }} / {{ minLengthError.requiredLength }} files provided.
                    </kbq-hint>
                }
            </kbq-file-upload>
            <button class="layout-margin-top-m" kbq-button type="submit">Submit</button>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadMultipleRequiredReactiveValidationExample {
    protected readonly customErrorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();

    protected readonly formMultiple = new FormGroup({
        fileUpload: new FormControl<FileList | KbqFileItem[]>([], [Validators.required, Validators.minLength(2)])
    });

    onSubmit() {
        console.log('perform action on submit');
    }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { FileValidators, KbqFileTypeSpecifier, ShowOnFormSubmitErrorStateMatcher } from '@koobiq/components/core';
import { KbqFileItem, KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title File upload single mixed validation example
 */
@Component({
    standalone: true,
    selector: 'file-upload-single-mixed-validation-example',
    template: `
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <kbq-file-upload
                #kbqFileUpload
                class="layout-margin-bottom-s"
                formControlName="fileUpload"
                [errorStateMatcher]="customErrorStateMatcher"
                [progressMode]="'indeterminate'"
            >
                <i kbq-icon="kbq-file-o_16"></i>

                <kbq-hint>Files with .txt extension are allowed</kbq-hint>

                @if (kbqFileUpload.invalid && form.controls.fileUpload.hasError('required')) {
                    <kbq-hint color="error">File required</kbq-hint>
                }

                @if (form.controls.fileUpload.hasError('fileExtensionMismatch')) {
                    <kbq-hint color="error">Provide valid extension</kbq-hint>
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadSingleMixedValidationExample {
    protected readonly customErrorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
    protected readonly accept: KbqFileTypeSpecifier = ['.txt'];

    protected readonly form = new FormGroup({
        fileUpload: new FormControl<KbqFileItem | null>(null, [
            Validators.required,
            FileValidators.isCorrectExtension(['.txt'])
        ])
    });

    onSubmit(): void {
        console.log('perform action on submit');
    }
}

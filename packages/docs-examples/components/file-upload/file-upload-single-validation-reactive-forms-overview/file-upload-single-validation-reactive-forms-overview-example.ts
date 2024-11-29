import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FileValidators } from '@koobiq/components/core';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

const MAX_FILE_SIZE = 5 * 2 ** 20;

/**
 * @title File-upload single validation reactive forms
 */
@Component({
    standalone: true,
    selector: 'file-upload-single-validation-reactive-forms-overview-example',
    template: `
        <form [formGroup]="formGroup">
            <kbq-file-upload class="layout-margin-bottom-s" formControlName="fileControl">
                @if (!formGroup.get('fileControl')?.errors) {
                    <i color="contrast-fade" kbq-icon="kbq-file-o_16"></i>
                }
                @if (formGroup.get('fileControl')?.errors) {
                    <i kbq-icon="kbq-exclamation-triangle_16"></i>
                }

                <kbq-hint>The file size should not exceed 5 MB</kbq-hint>

                @if (formGroup.get('fileControl')?.hasError('maxFileSize')) {
                    <kbq-hint color="error">The file size must not exceed the limit</kbq-hint>
                }
            </kbq-file-upload>
        </form>
    `,
    imports: [
        KbqFileUploadModule,
        KbqFormFieldModule,
        KbqIconModule,
        ReactiveFormsModule
    ]
})
export class FileUploadSingleValidationReactiveFormsOverviewExample {
    formGroup = new FormGroup({
        fileControl: new FormControl(null, FileValidators.maxFileSize(MAX_FILE_SIZE))
    });
}

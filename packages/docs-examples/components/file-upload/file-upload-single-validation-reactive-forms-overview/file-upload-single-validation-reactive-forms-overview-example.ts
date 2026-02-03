import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FileValidators } from '@koobiq/components/core';
import { KbqSingleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

const MAX_FILE_SIZE = 5 * 2 ** 20;

/**
 * @title File-upload single validation reactive forms
 */
@Component({
    selector: 'file-upload-single-validation-reactive-forms-overview-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqSingleFileUploadComponent
    ],
    template: `
        <form [formGroup]="formGroup">
            <kbq-file-upload class="layout-margin-bottom-s" formControlName="fileControl">
                @if (!formGroup.get('fileControl')?.errors) {
                    <i kbq-icon="kbq-file-o_16"></i>
                }
                @if (formGroup.get('fileControl')?.errors) {
                    <i kbq-icon="kbq-triangle-exclamation_16"></i>
                }

                @if (formGroup.get('fileControl')?.hasError('maxFileSize')) {
                    <kbq-hint color="error">The file size must not exceed the limit</kbq-hint>
                }

                <kbq-hint>The file size should not exceed 5 MB</kbq-hint>
            </kbq-file-upload>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadSingleValidationReactiveFormsOverviewExample {
    formGroup = new FormGroup({
        fileControl: new FormControl(null, FileValidators.maxFileSize(MAX_FILE_SIZE))
    });
}

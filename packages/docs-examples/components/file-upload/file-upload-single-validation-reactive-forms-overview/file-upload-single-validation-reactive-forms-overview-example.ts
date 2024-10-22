import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FileValidators } from '@koobiq/components/core';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';

const MAX_FILE_SIZE = 5 * 2 ** 20;

/**
 * @title File Upload Single Validation Reactive Forms
 */
@Component({
    standalone: true,
    selector: 'file-upload-single-validation-reactive-forms-overview-example',
    template: `
        <form [formGroup]="formGroup">
            <kbq-file-upload
                class="layout-margin-bottom-s"
                formControlName="fileControl"
            >
                @if (!this.fileControl.errors) {
                    <i kbq-icon="kbq-file-o_16"></i>
                }
                @if (this.fileControl.errors) {
                    <i kbq-icon="kbq-exclamation-triangle_16"></i>
                }

                <kbq-hint>Размер файла не должен быть более 5 МБ</kbq-hint>

                @if (this.fileControl.hasError('maxFileSize')) {
                    <kbq-hint color="error">Размер файла не должен превышать лимит.</kbq-hint>
                }
            </kbq-file-upload>
        </form>
    `,
    imports: [
        KbqFileUploadModule,
        KbqFormFieldModule,
        KbqIcon,
        ReactiveFormsModule
    ]
})
export class FileUploadSingleValidationReactiveFormsOverviewExample {
    formGroup = new FormGroup({
        fileControl: new FormControl(null, FileValidators.maxFileSize(MAX_FILE_SIZE))
    });

    get fileControl() {
        return this.formGroup.get('fileControl') as FormControl;
    }
}

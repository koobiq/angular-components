import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FileValidators } from '@koobiq/components/core';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title File upload single accept validation
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'file-upload-single-accept-validation-example',
    template: `
        <form [formGroup]="formGroup">
            <kbq-file-upload class="layout-margin-bottom-s" [accept]="accept" formControlName="fileControl">
                @if (!formGroup.get('fileControl')?.errors) {
                    <i kbq-icon="kbq-file-o_16"></i>
                }
                @if (formGroup.get('fileControl')?.errors) {
                    <i kbq-icon="kbq-exclamation-triangle_16"></i>
                }

                <kbq-hint>File with .txt extension is allowed</kbq-hint>

                @if (formGroup.get('fileControl')?.hasError('fileExtensionMismatch')) {
                    <kbq-hint color="error">Provide valid extension</kbq-hint>
                }
            </kbq-file-upload>
        </form>
    `,
    imports: [
        ReactiveFormsModule,
        KbqFileUploadModule,
        KbqFormFieldModule,
        KbqIconModule
    ]
})
export class FileUploadSingleAcceptValidationExample {
    accept = ['.txt'];

    formGroup = new FormGroup({
        fileControl: new FormControl(null, FileValidators.isCorrectExtension(this.accept))
    });
}

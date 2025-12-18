import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FileValidators, KbqFileTypeSpecifier } from '@koobiq/components/core';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title File upload single accept validation
 */
@Component({
    selector: 'file-upload-single-accept-validation-example',
    imports: [
        ReactiveFormsModule,
        KbqFileUploadModule,
        KbqFormFieldModule,
        KbqIconModule
    ],
    template: `
        <form [formGroup]="formGroup">
            <kbq-file-upload class="layout-margin-bottom-s" formControlName="fileControl" [accept]="accept">
                @if (!formGroup.get('fileControl')?.errors) {
                    <i kbq-icon="kbq-file-o_16"></i>
                }
                @if (formGroup.get('fileControl')?.errors) {
                    <i kbq-icon="kbq-triangle-exclamation_16"></i>
                }

                @if (formGroup.get('fileControl')?.hasError('fileExtensionMismatch')) {
                    <kbq-hint color="error">Provide valid extension</kbq-hint>
                }

                <kbq-hint>File with TXT extension is allowed</kbq-hint>
            </kbq-file-upload>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadSingleAcceptValidationExample {
    protected accept: KbqFileTypeSpecifier = ['.txt'];

    protected readonly formGroup = new FormGroup({
        fileControl: new FormControl(null, FileValidators.isCorrectExtension(this.accept))
    });
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FileValidators } from '@koobiq/components/core';
import { KbqFileItem, KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title File upload multiple accept validation
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'file-upload-multiple-accept-validation-example',
    template: `
        <kbq-file-upload (fileRemoved)="onFileRemoved($event)" (filesAdded)="onFilesAdded($event)" multiple>
            <ng-template #kbqFileIcon let-file>
                @if (!file.hasError) {
                    <i kbq-icon="kbq-file-o_16"></i>
                }
                @if (file.hasError) {
                    <i kbq-icon="kbq-exclamation-triangle_16"></i>
                }
            </ng-template>

            <kbq-hint>Files with .txt extension are allowed</kbq-hint>

            @for (control of fileList.controls; track $index) {
                <kbq-hint color="error">
                    @if (control.hasError('fileExtensionMismatch')) {
                        {{ control.value?.file?.name }} - {{ fileExtensionMismatchErrorMessage }}
                    }
                </kbq-hint>
            }
        </kbq-file-upload>
    `,
    imports: [
        ReactiveFormsModule,
        KbqFileUploadModule,
        KbqFormFieldModule,
        KbqIconModule
    ]
})
export class FileUploadMultipleAcceptValidationExample {
    accept = ['.txt'];
    fileExtensionMismatchErrorMessage = 'Provide valid extension';

    fileList = new FormArray<FormControl<KbqFileItem | null>>([]);

    constructor() {
        this.fileList.statusChanges.subscribe(() => {
            this.fileList.controls.forEach((control) => {
                if (control?.value && 'hasError' in control.value) {
                    control.value.hasError = control.invalid;
                }
            });
        });
    }

    onFileRemoved([
        _,
        index
    ]: [
        KbqFileItem,
        number
    ]) {
        this.fileList.removeAt(index);
    }

    onFilesAdded($event: KbqFileItem[]) {
        for (const fileItem of $event.slice()) {
            this.fileList.push(new FormControl(fileItem, FileValidators.isCorrectExtension(this.accept)));
        }
    }
}

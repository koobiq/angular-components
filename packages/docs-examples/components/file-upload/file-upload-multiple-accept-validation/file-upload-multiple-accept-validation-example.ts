import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FileValidators, KbqFileTypeSpecifier } from '@koobiq/components/core';
import { KbqFileItem, KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title File upload multiple accept validation
 */
@Component({
    selector: 'file-upload-multiple-accept-validation-example',
    imports: [
        ReactiveFormsModule,
        KbqFileUploadModule,
        KbqFormFieldModule,
        KbqIconModule
    ],
    template: `
        <kbq-file-upload multiple (fileRemoved)="onFileRemoved($event)" (filesAdded)="onFilesAdded($event)">
            <ng-template #kbqFileIcon let-file>
                @if (!file.hasError) {
                    <i kbq-icon="kbq-file-o_16"></i>
                }
                @if (file.hasError) {
                    <i kbq-icon="kbq-triangle-exclamation_16"></i>
                }
            </ng-template>

            <kbq-hint>Files with TXT extension are allowed</kbq-hint>

            @for (control of fileList.controls; track $index) {
                <kbq-hint color="error">
                    @if (control.hasError('fileExtensionMismatch')) {
                        {{ control.value?.file?.name }} - {{ fileExtensionMismatchErrorMessage }}
                    }
                </kbq-hint>
            }
        </kbq-file-upload>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadMultipleAcceptValidationExample {
    protected accept: KbqFileTypeSpecifier = ['.txt'];
    protected fileExtensionMismatchErrorMessage = 'Provide valid extension';

    protected readonly fileList = new FormArray<FormControl<KbqFileItem | null>>([]);

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
    ]): void {
        this.fileList.removeAt(index);
    }

    onFilesAdded($event: KbqFileItem[]): void {
        for (const fileItem of $event.slice()) {
            this.fileList.push(new FormControl(fileItem, FileValidators.isCorrectExtension(this.accept)));
        }
    }
}

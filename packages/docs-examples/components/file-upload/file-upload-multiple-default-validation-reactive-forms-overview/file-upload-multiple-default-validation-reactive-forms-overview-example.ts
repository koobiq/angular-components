import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FileValidators } from '@koobiq/components/core';
import { KbqFileItem, KbqMultipleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

const MAX_FILE_SIZE = 5 * 2 ** 20;

/**
 * @title File-upload multiple default validation reactive forms
 */
@Component({
    selector: 'file-upload-multiple-default-validation-reactive-forms-overview-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqMultipleFileUploadComponent
    ],
    template: `
        <kbq-file-upload
            multiple
            [progressMode]="'indeterminate'"
            (fileRemoved)="onFileRemoved($event)"
            (filesAdded)="onFilesAdded($event)"
        >
            <ng-template #kbqFileIcon let-file>
                @if (!file.hasError) {
                    <i kbq-icon="kbq-file-o_16"></i>
                }
                @if (file.hasError) {
                    <i kbq-icon="kbq-triangle-exclamation_16"></i>
                }
            </ng-template>

            <kbq-hint>The file size should not exceed 5 MB</kbq-hint>

            @for (control of fileList.controls; track $index) {
                <kbq-hint color="error">
                    @if (control.hasError('maxFileSize')) {
                        {{ control.value?.file?.name }} — {{ maxFileSizeErrorMessage }}
                    }
                </kbq-hint>
            }
        </kbq-file-upload>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadMultipleDefaultValidationReactiveFormsOverviewExample {
    maxFileSizeErrorMessage = 'The file size has exceeded the limit';

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
            this.fileList.push(new FormControl(fileItem, FileValidators.maxFileSize(MAX_FILE_SIZE)));
        }
    }
}

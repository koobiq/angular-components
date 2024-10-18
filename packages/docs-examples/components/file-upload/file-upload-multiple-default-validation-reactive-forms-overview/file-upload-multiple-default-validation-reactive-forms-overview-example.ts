import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { KbqFileItem, KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';

const maxFileExceededFn = (control: AbstractControl): ValidationErrors | null => {
    const kilo = 1024;
    const mega = kilo * kilo;
    const maxMbytes = 5;
    const maxSize = maxMbytes * mega;

    return ((control.value as KbqFileItem)?.file?.size ?? 0) > maxSize ? { maxFileSize: true } : null;
};

/**
 * @title file upload Multiple error overview
 */
@Component({
    standalone: true,
    selector: 'file-upload-multiple-default-validation-reactive-forms-overview-example',
    template: `
        <kbq-file-upload
            [progressMode]="'indeterminate'"
            (fileRemoved)="onFileRemoved($event)"
            (filesAdded)="onFilesAdded($event)"
            multiple
        >
            <ng-template
                #kbqFileIcon
                let-file
            >
                @if (!file.hasError) {
                    <i kbq-icon="kbq-file-o_16"></i>
                }
                <!-- Can be any other icon from package -->
                @if (file.hasError) {
                    <i kbq-icon="kbq-exclamation-triangle_16"></i>
                }
            </ng-template>
            @for (control of this.fileList.controls; track $index) {
                <kbq-hint color="error">
                    @if (control.hasError('maxFileSize')) {
                        {{ control.value?.file?.name }} - {{ maxFileSize }}
                    }
                </kbq-hint>
            }
        </kbq-file-upload>
    `,
    imports: [
        KbqFileUploadModule,
        KbqFormFieldModule,
        KbqIcon,
        ReactiveFormsModule
    ]
})
export class FileUploadMultipleDefaultValidationReactiveFormsOverviewExample {
    maxFileSize = 'Размер файла не должен быть более 5 МБ.';

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
            this.fileList.push(new FormControl(fileItem, maxFileExceededFn));
        }
    }
}

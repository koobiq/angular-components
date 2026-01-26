import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { FileValidators, KbqFileTypeSpecifier, ShowOnFormSubmitErrorStateMatcher } from '@koobiq/components/core';
import { KbqFileItem, KbqMultipleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title File upload multiple mixed validation example
 */
@Component({
    selector: 'file-upload-multiple-mixed-validation-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqButtonModule,
        KbqIconModule,
        KbqMultipleFileUploadComponent
    ],
    template: `
        <form [formGroup]="formMultiple">
            <kbq-file-upload
                #kbqFileUpload
                class="layout-margin-bottom-s"
                multiple
                formControlName="fileUpload"
                [errorStateMatcher]="customErrorStateMatcher"
                [progressMode]="'indeterminate'"
                (fileRemoved)="onFileRemoved($event)"
                (filesAdded)="onFilesAdded($event)"
            >
                <ng-template #kbqFileIcon>
                    <i kbq-icon="kbq-file-o_16"></i>
                </ng-template>

                @if (kbqFileUpload.invalid && formMultiple.controls.fileUpload.hasError('required')) {
                    <kbq-hint color="error">File required</kbq-hint>
                }

                @for (control of fileList.controls; track $index) {
                    <kbq-hint color="error">
                        @if (control.hasError('fileExtensionMismatch')) {
                            {{ control.value?.file?.name }} - {{ fileExtensionMismatchErrorMessage }}
                        }
                    </kbq-hint>
                }

                <kbq-hint>Files with TXT extension are allowed</kbq-hint>
            </kbq-file-upload>
            <button class="layout-margin-top-m" kbq-button type="submit">Submit</button>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadMultipleMixedValidationExample {
    protected readonly customErrorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
    protected readonly accept: KbqFileTypeSpecifier = ['.txt'];
    protected readonly fileExtensionMismatchErrorMessage = 'Provide valid extension';
    protected readonly cdr = inject(ChangeDetectorRef);

    protected readonly formMultiple = new FormGroup({
        fileUpload: new FormControl<FileList | KbqFileItem[]>([], Validators.required),
        fileList: new FormArray<FormControl<KbqFileItem | null>>([], Validators.required)
    });

    protected get fileList() {
        return this.formMultiple.controls.fileList;
    }

    constructor() {
        this.fileList.statusChanges.pipe(takeUntilDestroyed()).subscribe(() => {
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

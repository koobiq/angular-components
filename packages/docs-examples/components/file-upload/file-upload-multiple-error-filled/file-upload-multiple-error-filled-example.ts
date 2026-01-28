import { afterNextRender, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FileValidators, KbqFileTypeSpecifier } from '@koobiq/components/core';
import { KbqFileItem, KbqMultipleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqHint } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

const SIZE_IN_MB = 1;

const MAX_FILE_SIZE = SIZE_IN_MB * 2 ** 20;

const createBlobPart = (sizeInMB: number): BlobPart => {
    const chunk = 'a'.repeat(1024 * 1024);

    return Array(sizeInMB).fill(chunk).join('');
};

const createMockFile = (fileName: string = 'Filename.txt', options?: FilePropertyBag & { size?: number }) =>
    new File([createBlobPart(options?.size ?? 2)] satisfies BlobPart[], fileName, options);

/**
 * @title File-upload multiple error filled
 */
@Component({
    selector: 'file-upload-multiple-error-filled-example',
    imports: [
        KbqIconModule,
        KbqHint,
        KbqMultipleFileUploadComponent,
        ReactiveFormsModule
    ],
    template: `
        <form [formGroup]="formMultiple">
            <kbq-file-upload
                #kbqFileUpload
                class="layout-margin-bottom-s"
                multiple
                formControlName="fileUpload"
                [accept]="accept"
                [progressMode]="'indeterminate'"
                (itemRemoved)="onFileRemoved($event)"
                (itemsAdded)="onFilesAdded($event)"
            >
                <ng-template #kbqFileIcon>
                    <i kbq-icon="kbq-file-text-o_16"></i>
                </ng-template>

                @for (control of fileList.controls; track $index) {
                    <kbq-hint color="error">
                        @if (control.errors) {
                            <span>{{ control.value?.file?.name }} —&nbsp;</span>
                        }
                        @if (control.hasError('fileExtensionMismatch')) {
                            <span>{{ errorMessages.fileExtensionMismatch }}</span>
                            @if (control.hasError('fileExtensionMismatch') && control.hasError('maxFileSize')) {
                                <span>.</span>
                            }
                        }
                        @if (control.hasError('maxFileSize')) {
                            {{ errorMessages.maxFileSize }}
                        }
                    </kbq-hint>
                }

                <kbq-hint>{{ acceptedOutput }}. No more than 1 MB</kbq-hint>
            </kbq-file-upload>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadMultipleErrorFilledExample {
    protected accept: KbqFileTypeSpecifier = ['.doc', '.docx', '.pdf', '.txt'];
    protected acceptedOutput: string = this.accept
        .map((typeSpecifier) => typeSpecifier.replace('.', '').toUpperCase())
        .join(', ');

    errorMessages = {
        fileExtensionMismatch: 'Provide valid extension',
        maxFileSize: 'The file size limit has been exceeded'
    };
    protected readonly cdr = inject(ChangeDetectorRef);

    protected readonly formMultiple = new FormGroup({
        fileUpload: new FormControl<FileList | KbqFileItem[]>([]),
        fileList: new FormArray<FormControl<KbqFileItem | null>>([])
    });

    protected get fileUpload() {
        return this.formMultiple.controls.fileUpload;
    }

    protected get fileList() {
        return this.formMultiple.controls.fileList;
    }

    constructor() {
        this.fileList.statusChanges.pipe(takeUntilDestroyed()).subscribe(() => {
            console.log('statusChanges');
            this.fileList.controls.forEach((control) => {
                if (control?.value && 'hasError' in control.value) {
                    control.value.hasError = control.invalid;
                }
            });
        });

        afterNextRender(() => {
            const filesToAdd = [
                { file: createMockFile('file1.txt', { size: 2 }), hasError: false },
                { file: createMockFile('file2.docx', { size: 0 }), hasError: false },
                { file: createMockFile('file3.pdf', { size: 3 }), hasError: false }
            ];

            this.fileUpload.setValue(filesToAdd);
            this.onFilesAdded(filesToAdd);
            this.cdr.detectChanges();
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
            this.fileList.push(
                new FormControl(fileItem, [
                    FileValidators.isCorrectExtension(this.accept),
                    FileValidators.maxFileSize(MAX_FILE_SIZE)
                ])
            );
        }
    }
}

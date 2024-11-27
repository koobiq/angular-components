import { Component } from '@angular/core';
import { KbqFileItem, KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';

const MAX_FILE_SIZE = 5 * 2 ** 20;

const maxFileExceeded = (file: File): string | null => {
    return (file?.size ?? 0) > MAX_FILE_SIZE
        ? `${file.name} - Размер файла превышает максимально допустимый (5 МБ)`
        : null;
};

/**
 * @title File-upload multiple error
 */
@Component({
    standalone: true,
    selector: 'file-upload-multiple-error-overview-example',
    template: `
        <kbq-multiple-file-upload (fileQueueChanged)="onChange($event)" inputId="file-upload-multiple-error-overview">
            <ng-template #kbqFileIcon let-file>
                @if (!file.hasError) {
                    <i kbq-icon="kbq-file-o_16"></i>
                }
                @if (file.hasError) {
                    <i kbq-icon="kbq-exclamation-triangle_16"></i>
                }
            </ng-template>
            <kbq-hint>Максимальный размер файла 5 МБ</kbq-hint>
            @for (error of errors; track error) {
                <kbq-hint color="error">{{ error }}</kbq-hint>
            }
        </kbq-multiple-file-upload>
    `,
    imports: [
        KbqFileUploadModule,
        KbqFormFieldModule
    ]
})
export class FileUploadMultipleErrorOverviewExample {
    errors: string[] = [];
    files: KbqFileItem[] = [];

    onChange(files: KbqFileItem[]) {
        this.files = files;

        this.errors = [];
        this.files.forEach((file) => {
            const errorsPerFile: string[] = [maxFileExceeded(file.file) || ''].filter(Boolean);
            file.hasError = errorsPerFile.length > 0;

            this.errors = [
                ...this.errors,
                ...errorsPerFile
            ].filter(Boolean);
        });
    }
}

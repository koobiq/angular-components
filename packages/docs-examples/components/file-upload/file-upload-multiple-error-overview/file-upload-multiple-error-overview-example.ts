import { Component } from '@angular/core';
import { KbqFileItem, KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';

const maxFileExceeded = (file: File): string | null => {
    const kilo = 1024;
    const mega = kilo * kilo;
    const maxMbytes = 5;
    const maxSize = maxMbytes * mega;

    return (file?.size ?? 0) > maxSize
        ? `${file.name} - Размер файла превышает максимально допустимый (${maxSize / mega} МБ)`
        : null;
};

/**
 * @title file upload Multiple error overview
 */
@Component({
    standalone: true,
    selector: 'file-upload-multiple-error-overview-example',
    template: `
        <kbq-multiple-file-upload
            (fileQueueChanged)="onChange($event)"
            inputId="file-upload-multiple-error-overview"
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

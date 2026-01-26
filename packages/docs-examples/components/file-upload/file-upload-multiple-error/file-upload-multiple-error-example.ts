import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFileItem, KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

const MAX_FILE_SIZE = 5 * 2 ** 20;

const maxFileExceeded = (file: File): string | null => {
    return (file?.size ?? 0) > MAX_FILE_SIZE ? `${file.name} — The file size has exceeded the limit (5 MB)` : null;
};

/**
 * @title File-upload multiple error
 */
@Component({
    selector: 'file-upload-multiple-error-example',
    imports: [
        KbqFileUploadModule,
        KbqFormFieldModule,
        KbqIconModule
    ],
    template: `
        <kbq-multiple-file-upload inputId="file-upload-multiple-error-overview" (fileQueueChanged)="onChange($event)">
            <ng-template #kbqFileIcon let-file>
                @if (!file.hasError) {
                    <i kbq-icon="kbq-file-o_16"></i>
                }
                @if (file.hasError) {
                    <i kbq-icon="kbq-triangle-exclamation_16"></i>
                }
            </ng-template>
        </kbq-multiple-file-upload>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadMultipleErrorExample {
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

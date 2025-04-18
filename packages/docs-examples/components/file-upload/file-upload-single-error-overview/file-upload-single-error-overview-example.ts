import { Component } from '@angular/core';
import { KbqFileItem, KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';

/**
 * @title File-upload single error
 */
@Component({
    standalone: true,
    selector: 'file-upload-single-error-overview-example',
    template: `
        <kbq-single-file-upload
            [file]="file"
            (fileQueueChange)="onChange($event)"
            inputId="file-upload-single-error-overview"
        >
            @if (!errors.length) {
                <i color="contrast-fade" kbq-icon="kbq-file-o_16"></i>
            }
            @if (errors.length) {
                <i kbq-icon="kbq-exclamation-triangle_16"></i>
            }
            <kbq-hint>The file size should not exceed 5 MB</kbq-hint>
            @for (error of errors; track error) {
                <kbq-hint color="error">{{ error }}</kbq-hint>
            }
        </kbq-single-file-upload>
    `,
    imports: [
        KbqFileUploadModule,
        KbqFormFieldModule
    ]
})
export class FileUploadSingleErrorOverviewExample {
    errors: string[] = [];
    file: KbqFileItem | null;

    onChange(fileItem: KbqFileItem | null): void {
        this.file = fileItem;

        const someValidationLogic = (): string | null => {
            return 'The file could not be uploaded for unknown reasons';
        };

        if (this.file) {
            this.errors = [someValidationLogic() || ''].filter(Boolean);

            if (this.errors.length) {
                this.file = { ...this.file, hasError: true };
            }
        } else {
            this.errors = [];
        }
    }
}

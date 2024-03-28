import { Component } from '@angular/core';
import { KbqFileItem } from '@koobiq/components/file-upload';


/**
 * @title file upload single error overview
 */
@Component({
    selector: 'file-upload-multiple-error-overview-example',
    templateUrl: 'file-upload-multiple-error-overview-example.html',
    styleUrls: ['file-upload-multiple-error-overview-example.css']
})
export class FileUploadMultipleErrorOverviewExample {
    errors: string[] = [];
    files: KbqFileItem[] = [];

    onChange(files: KbqFileItem[]) {
        this.files = files;
        const maxFileExceeded = (file: File): string | null => {
            const kilo = 1024;
            const mega = kilo * kilo;
            const maxMbytes = 5;
            const maxSize = maxMbytes * mega;

            return maxSize !== undefined && (file?.size ?? 0) > maxSize
                ? `${file.name} - Размер файла превышает максимально допустимый (${maxSize / mega} МБ)`
                : null;
        };

        this.errors = [];
        this.files = this.files.map((file) => {
            const errorsPerFile: string[] = [maxFileExceeded(file.file) || ''].filter(Boolean);

            this.errors = [
                ...this.errors,
                ...errorsPerFile
            ].filter(Boolean);

            return {
                ...file,
                hasError: errorsPerFile.length > 0
            };
        });
    }
}

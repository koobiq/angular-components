import { Component } from '@angular/core';
import { KbqFileItem } from '@koobiq/components/file-upload';


/**
 * @title file upload single error overview
 */
@Component({
    selector: 'file-upload-single-error-overview-example',
    templateUrl: 'file-upload-single-error-overview-example.html',
    styleUrls: ['file-upload-single-error-overview-example.css']
})
export class FileUploadSingleErrorOverviewExample {
    errors: string[] = [];

    onChange(fileItem: KbqFileItem | null): void {
        const someValidationLogic = (): string | null => {
            return 'Не удалось загрузить файл по неизвестным причинам';
        };

        if (fileItem) {
            this.errors = [
                someValidationLogic() || ''
            ].filter(Boolean);
        }
    }
}

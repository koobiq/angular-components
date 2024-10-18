import { Component } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';

/**
 * @title File Upload Single Overview Example
 */
@Component({
    standalone: true,
    selector: 'file-upload-single-overview-example',
    imports: [
        KbqFileUploadModule
    ],
    template: `
        <kbq-single-file-upload>
            <i kbq-icon="kbq-file-o_16"></i>
        </kbq-single-file-upload>
    `
})
export class FileUploadSingleOverviewExample {
    themePalette = ThemePalette;
}

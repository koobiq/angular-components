import { Component } from '@angular/core';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';

/**
 * @title File-upload single
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
export class FileUploadSingleOverviewExample {}

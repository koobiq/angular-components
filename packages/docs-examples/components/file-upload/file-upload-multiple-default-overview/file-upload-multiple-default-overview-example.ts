import { Component } from '@angular/core';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title File Upload Multiple Default
 */
@Component({
    standalone: true,
    selector: 'file-upload-multiple-default-overview-example',
    template: `
        <kbq-multiple-file-upload>
            <ng-template #kbqFileIcon>
                <i kbq-icon="kbq-file-o_16"></i>
            </ng-template>
        </kbq-multiple-file-upload>
    `,
    imports: [
        KbqFileUploadModule,
        KbqIconModule
    ]
})
export class FileUploadMultipleDefaultOverviewExample {}

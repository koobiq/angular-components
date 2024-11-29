import { Component } from '@angular/core';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';

/**
 * @title File-upload multiple compact
 */
@Component({
    standalone: true,
    selector: 'file-upload-multiple-compact-overview-example',
    imports: [
        KbqFileUploadModule
    ],
    template: `
        <kbq-multiple-file-upload size="compact">
            <ng-template #kbqFileIcon let-file>
                <i color="contrast-fade" kbq-icon="kbq-file-o_16"></i>
            </ng-template>
        </kbq-multiple-file-upload>
    `
})
export class FileUploadMultipleCompactOverviewExample {}

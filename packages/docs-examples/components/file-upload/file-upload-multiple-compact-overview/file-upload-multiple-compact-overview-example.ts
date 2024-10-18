import { Component } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';

/**
 * @title File Upload Multiple Compact
 */
@Component({
    standalone: true,
    selector: 'file-upload-multiple-compact-overview-example',
    imports: [
        KbqFileUploadModule
    ],
    template: `
        <kbq-multiple-file-upload
            inputId="file-upload-multiple-compact"
            size="compact"
        >
            <ng-template
                #kbqFileIcon
                let-file
            >
                <i kbq-icon="kbq-file-o_16"></i>
            </ng-template>
        </kbq-multiple-file-upload>
    `
})
export class FileUploadMultipleCompactOverviewExample {
    themePalette = ThemePalette;
}

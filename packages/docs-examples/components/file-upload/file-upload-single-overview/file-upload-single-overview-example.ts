import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title File-upload single
 */
@Component({
    selector: 'file-upload-single-overview-example',
    imports: [
        KbqFileUploadModule,
        KbqIconModule
    ],
    template: `
        <kbq-single-file-upload>
            <i kbq-icon="kbq-file-o_16"></i>
        </kbq-single-file-upload>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadSingleOverviewExample {}

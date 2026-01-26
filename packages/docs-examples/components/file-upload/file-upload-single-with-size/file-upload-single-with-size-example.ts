import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSingleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title File-upload single with size
 */
@Component({
    selector: 'file-upload-single-with-size-example',
    imports: [
        KbqIconModule,
        KbqSingleFileUploadComponent
    ],
    template: `
        <kbq-single-file-upload [showFileSize]="true">
            <i kbq-icon="kbq-file-o_16"></i>
        </kbq-single-file-upload>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadSingleWithSizeExample {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMultipleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title File-upload multiple default
 */
@Component({
    selector: 'file-upload-multiple-default-overview-example',
    imports: [
        KbqIconModule,
        KbqMultipleFileUploadComponent
    ],
    template: `
        <kbq-multiple-file-upload>
            <ng-template #kbqFileIcon>
                <i kbq-icon="kbq-file-o_16"></i>
            </ng-template>
        </kbq-multiple-file-upload>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadMultipleDefaultOverviewExample {}

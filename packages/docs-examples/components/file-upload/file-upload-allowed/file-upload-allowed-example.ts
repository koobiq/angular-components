import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMultipleFileUploadComponent, KbqSingleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqIcon } from '@koobiq/components/icon';

/**
 * @title File-upload allowed
 */
@Component({
    selector: 'file-upload-allowed-example',
    imports: [
        KbqSingleFileUploadComponent,
        KbqMultipleFileUploadComponent,
        KbqIcon
    ],
    template: `
        <kbq-multiple-file-upload [allowed]="'mixed'">
            <ng-template #kbqFileIcon let-file>
                @if (!file.hasError) {
                    <i kbq-icon="kbq-file-o_16"></i>
                }
                @if (file.hasError) {
                    <i kbq-icon="kbq-triangle-exclamation_16"></i>
                }
            </ng-template>
        </kbq-multiple-file-upload>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadAllowedExample {}

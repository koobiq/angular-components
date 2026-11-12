import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMultipleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title File-upload multiple add strategy
 */
@Component({
    selector: 'file-upload-multiple-add-strategy-example',
    imports: [
        KbqIconModule,
        KbqMultipleFileUploadComponent
    ],
    template: `
        <kbq-multiple-file-upload [addStrategy]="'replace'">
            <ng-template #kbqFileIcon>
                <i kbq-icon="kbq-file-text-o_16"></i>
            </ng-template>
        </kbq-multiple-file-upload>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadMultipleAddStrategyExample {}

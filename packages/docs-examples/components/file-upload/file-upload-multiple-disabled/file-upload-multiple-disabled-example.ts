import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMultipleFileUploadComponent } from '@koobiq/components/file-upload';

/**
 * @title File-upload multiple disabled
 */
@Component({
    selector: 'file-upload-multiple-disabled-example',
    imports: [KbqMultipleFileUploadComponent],
    template: `
        <kbq-multiple-file-upload [disabled]="true" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadMultipleDisabledExample {}

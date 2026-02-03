import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFileItem, KbqMultipleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';

const createBlobPart = (sizeInMB: number): BlobPart => {
    const chunk = 'a'.repeat(1024 * 1024);

    return Array(sizeInMB).fill(chunk).join('');
};

const createMockFile = (fileName: string = 'Filename.txt', options?: FilePropertyBag & { size?: number }) =>
    new File([createBlobPart(options?.size ?? 2)] satisfies BlobPart[], fileName, options);

/**
 * @title File-upload multiple with max height
 */
@Component({
    selector: 'file-upload-multiple-with-max-height-example',
    imports: [
        KbqIconModule,
        KbqMultipleFileUploadComponent,
        FormsModule
    ],
    template: `
        <kbq-multiple-file-upload [(ngModel)]="files">
            <ng-template #kbqFileIcon>
                <i kbq-icon="kbq-file-text-o_16"></i>
            </ng-template>
        </kbq-multiple-file-upload>
    `,
    styles: `
        :host {
            .kbq-multiple-file-upload {
                --kbq-file-upload-size-multiple-max-height: 201px;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadMultipleWithMaxHeightExample {
    files: KbqFileItem[] = [
        { file: createMockFile('project_alpha.txt', { size: 1 }) },
        { file: createMockFile('report_final.docx', { size: 2 }) },
        { file: createMockFile('presentation_overview.pptx', { size: 3 }) },
        { file: createMockFile('data_analysis.csv', { size: 4 }) },
        { file: createMockFile('summary_notes.pdf', { size: 5 }) }];
}

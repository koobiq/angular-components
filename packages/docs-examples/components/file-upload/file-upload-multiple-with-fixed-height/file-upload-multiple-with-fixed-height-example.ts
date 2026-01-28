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
 * @title File-upload multiple with fixed height
 */
@Component({
    selector: 'file-upload-multiple-with-fixed-height-example',
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
                --kbq-file-upload-size-multiple-big-container-min-height: 232px;
                --kbq-file-upload-size-multiple-min-height: 160px;
                --kbq-file-upload-size-multiple-max-height: 160px;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadMultipleWithFixedHeightExample {
    files: KbqFileItem[] = [
        { file: createMockFile('project_report.docx', { size: 1 }) },
        { file: createMockFile('Name', { size: 2 }) },
        { file: createMockFile('meeting_notes.txt', { size: 3 }) },
        { file: createMockFile('presentation_slide.pptx', { size: 4 }) },
        { file: createMockFile('research_paper.pdf', { size: 5 }) }];
}

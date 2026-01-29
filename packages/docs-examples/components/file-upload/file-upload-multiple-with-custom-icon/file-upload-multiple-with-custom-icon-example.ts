import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFileItem, KbqMultipleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';

const createBlobPart = (sizeInMB: number): BlobPart => {
    const chunk = 'a'.repeat(1024 * 1024);

    return Array(sizeInMB).fill(chunk).join('');
};

const createMockFile = (fileName: string = 'Filename.txt', options?: FilePropertyBag) =>
    new File([createBlobPart(2)] satisfies BlobPart[], fileName, options);

/**
 * @title File-upload multiple with custom icon
 */
@Component({
    selector: 'file-upload-multiple-with-custom-icon-example',
    imports: [
        KbqIconModule,
        KbqMultipleFileUploadComponent
    ],
    template: `
        <kbq-multiple-file-upload [files]="files">
            <ng-template #kbqFileIcon let-file>
                @if (file.file.name.includes('jpg')) {
                    <i kbq-icon="kbq-image_16"></i>
                } @else if (file.file.name.includes('txt')) {
                    <i kbq-icon="kbq-file-text-o_16"></i>
                }
            </ng-template>
        </kbq-multiple-file-upload>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadMultipleWithCustomIconExample {
    files: KbqFileItem[] = [
        { file: createMockFile('image.jpg') },
        { file: createMockFile('file.txt') }];
}

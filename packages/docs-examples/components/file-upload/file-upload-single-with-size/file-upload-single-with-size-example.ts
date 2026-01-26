import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqSingleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';

const createBlobPart = (sizeInMB: number): BlobPart => {
    const chunk = 'a'.repeat(1024 * 1024);

    return Array(sizeInMB).fill(chunk).join('');
};

const createMockFile = (fileName: string = 'Filename.txt', options?: FilePropertyBag) =>
    new File([createBlobPart(2)] satisfies BlobPart[], fileName, options);

/**
 * @title File-upload single with size
 */
@Component({
    selector: 'file-upload-single-with-size-example',
    imports: [
        KbqIconModule,
        KbqSingleFileUploadComponent,
        ReactiveFormsModule
    ],
    template: `
        <kbq-single-file-upload [showFileSize]="true" [formControl]="control">
            <i kbq-icon="kbq-file-text-o_16"></i>
        </kbq-single-file-upload>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadSingleWithSizeExample {
    control = new FormControl(createMockFile('Filename.txt', { type: 'text/plain' }));
}

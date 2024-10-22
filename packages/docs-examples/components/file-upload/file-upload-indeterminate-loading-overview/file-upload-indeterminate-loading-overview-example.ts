import { Component } from '@angular/core';
import { KbqFileItem, KbqFileUploadModule } from '@koobiq/components/file-upload';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';

/**
 * @title File Upload Indeterminate Loading
 */
@Component({
    standalone: true,
    selector: 'file-upload-indeterminate-loading-overview-example',
    imports: [
        KbqFileUploadModule
    ],
    template: `
        <kbq-file-upload
            (fileQueueChange)="onFileChange($event)"
            progressMode="indeterminate"
        >
            <i kbq-icon="kbq-file-o_16"></i>
        </kbq-file-upload>

        <kbq-file-upload
            (fileQueueChanged)="onFilesChange($event)"
            multiple
            progressMode="indeterminate"
        >
            <i kbq-icon="kbq-file-o_16"></i>
        </kbq-file-upload>

        @if (isLoading) {
            <p class="kbq-body">Immediately load to backend...</p>
        }
    `
})
export class FileUploadIndeterminateLoadingOverviewExample {
    isLoading: boolean;

    onFileChange(file: KbqFileItem | null) {
        if (!file) {
            return;
        }

        const fakeBackendResponse = timer(1500);

        file.loading?.next(true);
        this.isLoading = true;
        fakeBackendResponse.pipe(take(1)).subscribe(() => {
            file.loading?.next(false);
            this.isLoading = false;
        });
    }

    onFilesChange(files: KbqFileItem[] | null) {
        if (!files?.length) {
            return;
        }

        const fakeBackendResponse = timer(1500);

        this.isLoading = true;
        files.forEach((file) => file.loading?.next(true));

        fakeBackendResponse.pipe(take(1)).subscribe(() => {
            files.forEach((file) => file.loading?.next(false));
            this.isLoading = false;
        });
    }
}

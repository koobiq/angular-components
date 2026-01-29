import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    KbqFileItem,
    KbqMultipleFileUploadComponent,
    KbqSingleFileUploadComponent
} from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';

/**
 * @title File-upload indeterminate loading
 */
@Component({
    selector: 'file-upload-indeterminate-loading-overview-example',
    imports: [
        KbqIconModule,
        KbqSingleFileUploadComponent,
        KbqMultipleFileUploadComponent
    ],
    template: `
        <kbq-file-upload progressMode="indeterminate" (fileQueueChange)="onFileChange($event)">
            <i kbq-icon="kbq-file-o_16"></i>
        </kbq-file-upload>

        <kbq-file-upload multiple progressMode="indeterminate" (fileQueueChanged)="onFilesChange($event)">
            <ng-template #kbqFileIcon>
                <i kbq-icon="kbq-file-o_16"></i>
            </ng-template>
        </kbq-file-upload>

        @if (isLoading) {
            <p class="kbq-text-big">Immediately load to backend...</p>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-gap-l'
    }
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

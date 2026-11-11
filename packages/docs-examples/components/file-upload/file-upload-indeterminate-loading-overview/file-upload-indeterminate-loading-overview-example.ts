import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    KbqFileItem,
    KbqMultipleFileUploadComponent,
    KbqSingleFileUploadComponent
} from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { injectExampleText } from '../l10n';

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
        <kbq-file-upload progressMode="indeterminate" (fileChange)="onFileChange($event)">
            <i kbq-icon="kbq-file-o_16"></i>
        </kbq-file-upload>

        <kbq-file-upload multiple progressMode="indeterminate" (filesChange)="onFilesChange($event)">
            <ng-template #kbqFileIcon>
                <i kbq-icon="kbq-file-o_16"></i>
            </ng-template>
        </kbq-file-upload>

        @if (isLoading) {
            <p class="kbq-text-big">{{ text().immediatelyLoad }}</p>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-gap-l'
    }
})
export class FileUploadIndeterminateLoadingOverviewExample {
    protected readonly text = injectExampleText();

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

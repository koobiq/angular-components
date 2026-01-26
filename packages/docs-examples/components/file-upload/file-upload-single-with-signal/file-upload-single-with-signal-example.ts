import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    KbqFileItem,
    KbqMultipleFileUploadComponent,
    KbqSingleFileUploadComponent
} from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title File-upload single
 */
@Component({
    selector: 'file-upload-single-with-signal-example',
    imports: [KbqIconModule, KbqSingleFileUploadComponent, KbqMultipleFileUploadComponent],
    template: `
        <div class="layout-margin-bottom-l">
            <kbq-file-upload [file]="file()" (fileQueueChange)="onSingleChange($event)">
                <i kbq-icon="kbq-file-o_16"></i>
            </kbq-file-upload>
        </div>

        <kbq-file-upload multiple [files]="files()" (fileQueueChanged)="onMultipleChange($event)">
            <i kbq-icon="kbq-file-o_16"></i>
        </kbq-file-upload>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadSingleWithSignalExample {
    file = signal<KbqFileItem | null>(null);
    files = signal<KbqFileItem[]>([]);

    onSingleChange($event: KbqFileItem | null) {
        if ($event) {
            this.file.set({ ...$event, hasError: true });

            return;
        }

        this.file.set($event);
    }

    onMultipleChange($event: KbqFileItem[]) {
        const updatedItems = $event.map((fileItem) => ({ ...fileItem, hasError: true }));

        this.files.set(updatedItems);
    }
}

import { ChangeDetectionStrategy, Component, DestroyRef, inject, model, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqContentPanelModule } from '@koobiq/components/content-panel';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import {
    KbqFileItem,
    KbqFullScreenDropzoneService,
    KbqMultipleFileUploadComponent
} from '@koobiq/components/file-upload';
import { KbqIcon } from '@koobiq/components/icon';

/**
 * @title File-upload Dropzone
 */
@Component({
    selector: 'file-upload-dropzone-example',
    imports: [
        KbqMultipleFileUploadComponent,
        KbqContentPanelModule,
        KbqEmptyStateModule,
        FormsModule,
        KbqIcon
    ],
    template: `
        @if (files().length) {
            <kbq-file-upload multiple [(ngModel)]="files">
                <ng-template #kbqFileIcon>
                    <i kbq-icon="kbq-file-text-o_16"></i>
                </ng-template>
            </kbq-file-upload>
        } @else {
            <kbq-empty-state>
                <div kbq-empty-state-text>Drop files here</div>
            </kbq-empty-state>
        }
    `,
    styles: `
        :host {
            .kbq-empty-state {
                height: 128px;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadDropzoneExample {
    protected readonly files = model<KbqFileItem[]>([]);

    protected readonly fileUpload = viewChild(KbqMultipleFileUploadComponent);

    protected readonly dropzoneService = inject(KbqFullScreenDropzoneService);
    protected readonly destroyRef = inject(DestroyRef);

    constructor() {
        const sub = this.dropzoneService.filesDropped.subscribe((files) => {
            this.files.set(files.map((file) => ({ file })));
        });

        this.dropzoneService.init({ title: 'Drop files here' });

        this.destroyRef.onDestroy(() => sub.unsubscribe());
    }
}

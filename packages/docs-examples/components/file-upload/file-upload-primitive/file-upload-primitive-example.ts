import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqBadge } from '@koobiq/components/badge';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import { KbqEmptyState } from '@koobiq/components/empty-state';
import {
    KbqFile,
    KbqFileDropDirective,
    KbqFileList,
    KbqFileLoader,
    KbqFileUploadContext
} from '@koobiq/components/file-upload';
import { KbqIconButton, KbqIconItem } from '@koobiq/components/icon';
import { BehaviorSubject } from 'rxjs';

/**
 @title File upload primitive
 */
@Component({
    selector: 'file-upload-primitive-example',
    imports: [
        KbqFileDropDirective,
        KbqFileUploadContext,
        KbqFileLoader,
        KbqButton,
        KbqButtonCssStyler,
        KbqFileList,
        KbqIconButton,
        KbqBadge,
        KbqEmptyState,
        KbqIconItem
    ],
    template: `
        <div
            kbqFileUploadContext
            kbqFileDrop
            multiple
            [id]="'custom-file-upload'"
            [disabled]="false"
            (filesDropped)="onFilesDropped($event)"
        >
            <kbq-empty-state size="big" style="min-height: 216px">
                <i
                    kbq-empty-state-icon
                    kbq-icon-item="kbq-arrow-up-from-line_16"
                    [big]="true"
                    [color]="'contrast'"
                    [fade]="true"
                ></i>
                <div kbq-empty-state-title>Click to upload or drag and drop</div>
                <div kbq-empty-state-actions>
                    <label
                        #ref="kbqFileLoader"
                        kbqFileLoader
                        (click)="ref.input().nativeElement.click()"
                        (fileChange)="onFileClicked($event)"
                    >
                        <button kbq-button [color]="'theme'" [kbqStyle]="'transparent'">Choose a file</button>
                    </label>
                </div>
            </kbq-empty-state>
            <div #list="kbqFileList" kbqFileList>
                @for (item of list.list(); track item) {
                    <div class="list-item">
                        <kbq-badge>{{ item.file.name }}</kbq-badge>
                        <i kbq-icon-button="kbq-minus_16" (click)="list.removeAt($index)"></i>
                    </div>
                }
            </div>
        </div>
    `,
    styles: `
        .kbq-file-drop {
            min-height: 300px;
            width: 500px;
            background: var(--kbq-background-card);
            border: 1px dashed var(--kbq-line-contrast-less);
            border-radius: 8px;
            margin-bottom: var(--kbq-size-m);
        }

        .kbq-file-list {
            display: flex;
            width: 100%;

            &:not(:empty) {
                padding-top: var(--kbq-size-s);
            }
        }

        .list-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            box-shadow: var(--kbq-shadow-card);
            padding: var(--kbq-size-s);
            margin: var(--kbq-size-m);
            border-radius: var(--kbq-size-border-radius);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadPrimitiveExample {
    list = viewChild.required(KbqFileList);

    onFileClicked({ target }: Event) {
        if (!(target instanceof HTMLInputElement)) return;
        const fileToAdd = target.files?.item(0);

        if (fileToAdd) {
            this.list().add({
                file: fileToAdd,
                hasError: false,
                loading: new BehaviorSubject<boolean>(false),
                progress: new BehaviorSubject<number>(0)
            });
        }

        target.value = null as any;
    }

    onFilesDropped(files: KbqFile[] | null): void {
        if (!files) return;

        this.list().addArray(
            Array.from(files).map((file: File) => ({
                file,
                hasError: false,
                loading: new BehaviorSubject<boolean>(false),
                progress: new BehaviorSubject<number>(0)
            }))
        );
    }
}

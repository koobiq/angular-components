import { DOCUMENT } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, inject, Renderer2, viewChild } from '@angular/core';
import { AbstractControl, FormGroupDirective, FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import { ErrorStateMatcher } from '@koobiq/components/core';
import {
    KbqFileItem,
    KbqFileUploadAllowedType,
    KbqFileUploadAllowedTypeValues,
    KbqFileUploadModule,
    KbqFullScreenDropzoneService,
    KbqLocalDropzone,
    KbqMultipleFileUploadComponent
} from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';

type SingleUploadState = {
    file: KbqFileItem | null;
    disabled?: boolean;
    error?: boolean;
    dragover?: boolean;
    icon?: string;
    showFileSize?: boolean;
    className?: string;
    allowed?: KbqFileUploadAllowedTypeValues;
};

type MultipleUploadState = {
    files: KbqFileItem[];
    disabled?: boolean;
    error?: boolean;
    dragover?: boolean;
    icon?: string;
    className?: string;
    size?: KbqMultipleFileUploadComponent['size'];
    type?: 'error';
    allowed?: KbqFileUploadAllowedTypeValues;
};

class CustomErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(_control: AbstractControl | null, _form: FormGroupDirective | NgForm | null): boolean {
        return true;
    }
}

@Component({
    selector: 'e2e-file-upload-state-and-style',
    imports: [
        KbqFileUploadModule,
        ReactiveFormsModule,
        KbqIconModule,
        FormsModule
    ],
    template: `
        <div>
            <table data-testid="e2eSingleFileUploadTable">
                @for (row of singleFileUploadRows; track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td>
                                <kbq-file-upload
                                    [allowed]="cell.allowed ?? kbqFileUploadAllowedTypes.File"
                                    [file]="cell.file"
                                    [class]="cell.className"
                                    [showFileSize]="cell.showFileSize ?? true"
                                    [disabled]="!!cell.disabled"
                                    [class.dev-error]="!!cell.error"
                                    [class.dev-dragover]="!!cell.dragover"
                                    [errorStateMatcher]="getErrorStateMatcher(!!cell.error)"
                                    [(ngModel)]="cell.file"
                                >
                                    <i kbq-icon="" [class]="cell.icon || iconClass.default"></i>
                                </kbq-file-upload>
                            </td>
                        }
                    </tr>
                }
            </table>
        </div>

        <div>
            <table data-testid="e2eMultipleFileUploadTable">
                @for (row of multipleFileUploadRows; track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td>
                                <kbq-multiple-file-upload
                                    [allowed]="cell.allowed ?? kbqFileUploadAllowedTypes.File"
                                    [class]="cell.className"
                                    [class.dev-error]="!!cell.error"
                                    [class.dev-dragover]="!!cell.dragover"
                                    [files]="cell.files"
                                    [disabled]="cell.disabled || false"
                                    [size]="cell.size || 'default'"
                                    [errorStateMatcher]="getErrorStateMatcher(!!cell.error)"
                                >
                                    <ng-template #kbqFileIcon>
                                        <i kbq-icon="" [class]="cell.icon || iconClass.default"></i>
                                    </ng-template>
                                </kbq-multiple-file-upload>
                            </td>
                        }
                    </tr>
                }
            </table>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-margin-bottom-l layout-column',
        'data-testid': 'e2eFileUploadStateAndStyle'
    }
})
export class E2eFileUploadStateAndStyle {
    protected readonly iconClass = { error: 'kbq-circle-info_16', default: 'kbq-file-o_16' };

    protected readonly singleFileUploadRows: SingleUploadState[][] = [
        // Simple (no file selected)
        [
            { file: null },
            { file: null, disabled: true },
            { file: null, icon: this.iconClass.error, error: true },
            { file: null, dragover: true }],

        // File picker allowed types
        [
            { file: null, allowed: KbqFileUploadAllowedType.Folder },
            { file: null, allowed: KbqFileUploadAllowedType.Mixed },
            { file: null, allowed: KbqFileUploadAllowedType.File }
        ],
        // File selected, fileSize shown
        [
            { file: this.testKbqFileItem },
            { file: this.testKbqFileItem, disabled: true },
            { file: this.testKbqFileItem, icon: this.iconClass.error, error: true },
            { file: this.testKbqFileItem, dragover: true }],

        // File selected, fileSize hidden
        [
            { file: this.testKbqFileItem, showFileSize: false },
            { file: this.testKbqFileItem, showFileSize: false, disabled: true },
            {
                file: this.testKbqFileItem,
                icon: this.iconClass.error,
                showFileSize: false,
                error: true
            },
            {
                file: this.testKbqFileItem,
                icon: this.iconClass.default,
                showFileSize: false,
                dragover: true
            }
        ],
        [
            { file: this.testKbqFileItem, showFileSize: false, className: 'dev-focused' },
            { file: this.testKbqFileItem, showFileSize: true, className: 'dev-focused' },
            { file: this.testKbqFileItem, showFileSize: true, className: 'dev-focused', error: true },
            { file: this.testKbqFileItem, showFileSize: true, className: 'dev-focused', dragover: true }
        ]
    ];

    protected readonly multipleFileUploadRows: MultipleUploadState[][] = [
        // Row 1: No file selected
        [
            { files: [] },
            { files: [], disabled: true },
            { files: [], icon: this.iconClass.error, error: true },
            { files: [], dragover: true }],
        [
            { files: [], allowed: KbqFileUploadAllowedType.Folder },
            { files: [], allowed: KbqFileUploadAllowedType.Mixed },
            { files: [], allowed: KbqFileUploadAllowedType.File }
        ],
        // Row 2: File selected
        [
            { files: [this.testKbqFileItem] },
            { files: [this.testKbqFileItem], disabled: true },
            { files: [this.testKbqFileItem], type: 'error' },
            { files: [this.testKbqFileItem], dragover: true }],
        // Row 3: Compact, no file selected
        [
            { files: [], size: 'compact' },
            { files: [], size: 'compact', disabled: true },
            { files: [], icon: this.iconClass.error, size: 'compact', error: true },
            { files: [], size: 'compact', dragover: true }
        ],
        // Row 4: Misc
        [
            { files: [this.testKbqFileItem], icon: this.iconClass.error, type: 'error', dragover: true },
            { files: [this.testKbqFileItem], className: 'dev-focused' },
            { files: [this.testKbqFileItem], className: 'dev-focused', type: 'error' },
            { files: [this.testKbqFileItem], className: 'dev-focused', type: 'error', dragover: true }
        ],
        [
            { files: [this.testKbqFileItem], className: 'dev-hover' },
            { files: [this.testKbqFileItem], className: 'dev-hover', error: true },
            { files: [this.testKbqFileItem], className: 'dev-hover', type: 'error' },
            { files: [this.testKbqFileItem], className: 'dev-hover', type: 'error', dragover: true }
        ],
        [
            { files: [this.testKbqFileItem], className: 'dev-hover', error: true, type: 'error' },
            { files: [this.testKbqFileItem], className: 'dev-hover', dragover: true }
        ]
    ];

    private readonly renderer = inject(Renderer2);
    private readonly document = inject(DOCUMENT);

    protected get testKbqFileItem(): KbqFileItem {
        return { file: new File(['test'] satisfies BlobPart[], 'test.file') } satisfies KbqFileItem;
    }

    getErrorStateMatcher(isError: boolean): any {
        return isError ? new CustomErrorStateMatcher() : null;
    }

    constructor() {
        afterNextRender(() => {
            this.document
                .querySelectorAll('.dev-dragover .kbq-file-upload')
                .forEach((el) => this.renderer.addClass(el, 'kbq-file-drop_dragover'));

            this.document
                .querySelectorAll('.dev-error .kbq-file-upload')
                .forEach((el) => this.renderer.addClass(el, 'kbq-error'));

            this.document.querySelectorAll<HTMLElement>('.dev-focused .kbq-file-upload__action').forEach((button) => {
                button.classList.add('cdk-focused');
                button.classList.add('cdk-keyboard-focused');
            });

            this.document.querySelectorAll<HTMLElement>('.dev-hover .kbq-file-upload__item').forEach((item) => {
                item.classList.add('kbq-hovered');
            });

            setTimeout(() => {
                this.document
                    .querySelectorAll<HTMLElement>('.kbq-single-file-upload.dev-focused .kbq-file-upload__action')
                    .forEach((button) => {
                        button.classList.add('cdk-focused');
                        button.classList.add('cdk-keyboard-focused');
                    });
            });
        });

        this.multipleFileUploadRows.forEach((row) =>
            row.forEach((cell) => {
                if (cell?.type !== 'error') return;

                cell.files.forEach((file) => (file.hasError = true));
            })
        );
    }

    protected readonly kbqFileUploadAllowedTypes = KbqFileUploadAllowedType;
}

@Component({
    selector: 'e2e-dropzone-style',
    imports: [
        KbqButton,
        KbqButtonCssStyler,
        KbqLocalDropzone
    ],
    template: `
        <div class="layout-row">
            <button
                kbq-button
                data-testid="e2eLocalDropzoneTrigger"
                (click)="localDropzone().open({ title: 'Local Dropzone', caption: 'caption' })"
            >
                Show Local Dropzone
            </button>
            <button
                kbq-button
                data-testid="e2eFullScreenDropzoneTrigger"
                (click)="
                    fullScreenDropzoneService.open({
                        title: 'Full-screen dropzone',
                        caption: 'caption',
                        size: 'normal'
                    })
                "
            >
                Show FullScreen Dropzone
            </button>
        </div>

        <div style="height: 300px; width: 300px" data-testid="e2eLocalDropzoneArea" kbqLocalDropzone></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-margin-bottom-l layout-column',
        'data-testid': 'e2eDropzoneStyle'
    }
})
export class E2eDropzoneStyle {
    protected readonly localDropzone = viewChild.required(KbqLocalDropzone);
    protected readonly fullScreenDropzoneService = inject(KbqFullScreenDropzoneService);
}

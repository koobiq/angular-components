import { DOCUMENT } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, inject, Renderer2 } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
    KbqFileItem,
    KbqFileUploadAllowedType,
    KbqFileUploadModule,
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
    allowed?: KbqFileUploadAllowedType;
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
    allowed?: KbqFileUploadAllowedType;
};

@Component({
    selector: 'e2e-file-upload-state-and-style',
    imports: [KbqFileUploadModule, ReactiveFormsModule, KbqIconModule],
    template: `
        <div>
            <table data-testid="e2eSingleFileUploadTable">
                @for (row of singleFileUploadRows; track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td>
                                <kbq-file-upload
                                    [allowed]="cell.allowed ?? 'file'"
                                    [file]="cell.file"
                                    [showFileSize]="cell.showFileSize ?? true"
                                    [disabled]="!!cell.disabled"
                                    [class.dev-error]="!!cell.error"
                                    [class.dev-dragover]="!!cell.dragover"
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
                                    [allowed]="cell.allowed ?? 'file'"
                                    [class]="cell.className"
                                    [class.dev-error]="!!cell.error"
                                    [class.dev-dragover]="!!cell.dragover"
                                    [files]="cell.files"
                                    [disabled]="cell.disabled || false"
                                    [size]="cell.size || 'default'"
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
            { file: null, allowed: 'folder' },
            { file: null, allowed: 'mixed' },
            { file: null, allowed: 'file' }
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
            { files: [], allowed: 'folder' },
            { files: [], allowed: 'mixed' },
            { files: [], allowed: 'file' }
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
            { files: [this.testKbqFileItem], className: 'dev-focused' }
        ]
    ];

    private readonly renderer = inject(Renderer2);
    private readonly document = inject(DOCUMENT);

    protected get testKbqFileItem(): KbqFileItem {
        return { file: new File(['test'] satisfies BlobPart[], 'test.file') } satisfies KbqFileItem;
    }

    constructor() {
        afterNextRender(() => {
            this.document
                .querySelectorAll('.dev-dragover .kbq-file-upload')
                .forEach((el) => this.renderer.addClass(el, 'kbq-file-drop_dragover'));

            this.document
                .querySelectorAll('.dev-error .kbq-file-upload')
                .forEach((el) => this.renderer.addClass(el, 'kbq-error'));

            (this.document.querySelector('.dev-focused .kbq-list-selection') satisfies HTMLElement | null)?.focus();
        });

        this.multipleFileUploadRows.forEach((row) =>
            row.forEach((cell) => {
                if (cell?.type !== 'error') return;

                cell.files.forEach((file) => (file.hasError = true));
            })
        );
    }
}

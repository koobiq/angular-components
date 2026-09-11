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
    KbqLocalDropzone
} from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';
import { kbqScrollbarOptionsProvider } from '@koobiq/components/scrollbar';

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
    size?: 'compact' | 'default';
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

        <!--
            Deliberately outside both tables: a td under table-layout auto grows to max-content, which hands
            the row all the width it asks for and hides the very overflow this case exists to catch. 320px is
            the design minimum the empty state renders at
            (--kbq-file-upload-size-multiple-big-container-min-width); once a file is present the component
            sets no minimum of its own, so the wrapper below is what pins the width.
        -->
        <div style="width: 320px" data-testid="e2eMultipleFileUploadLongName">
            <kbq-multiple-file-upload [files]="longNameFiles">
                <ng-template #kbqFileIcon>
                    <i kbq-icon="" [class]="iconClass.default"></i>
                </ng-template>
            </kbq-multiple-file-upload>
        </div>

        <!-- The single-file variant lays the name out through the same directive, at the same width. -->
        <div style="width: 320px" data-testid="e2eSingleFileUploadLongName">
            <kbq-file-upload [file]="longNameFiles[0]">
                <i kbq-icon="" [class]="iconClass.default"></i>
            </kbq-file-upload>
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
            { file: null, dragover: true }
        ],

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
            { file: this.testKbqFileItem, dragover: true }
        ],

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
            { files: [], dragover: true }
        ],
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
            { files: [this.testKbqFileItem], dragover: true }
        ],
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

    protected readonly longNameFiles: KbqFileItem[] = [
        {
            file: new File(
                ['test'] satisfies BlobPart[],
                'очень-длинное-название-файла-которое-точно-не-влезает-в-контейнер.pdf'
            )
        }
    ];

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

            // The single-file upload clears the classes applied above once its own focus monitor
            // runs, so they have to be put back after it rather than only in `afterNextRender`.
            setTimeout(() => {
                this.document
                    .querySelectorAll<HTMLElement>('.kbq-single-file-upload.dev-focused .kbq-file-upload__action')
                    .forEach((button) => {
                        button.classList.add('cdk-focused');
                        button.classList.add('cdk-keyboard-focused');
                    });

                // Set last, so the spec has one signal that is reachable only after the re-application
                // above. Counting undecorated elements cannot serve: that count is zero both here and
                // in the window before the focus monitor clears them.
                this.document
                    .querySelectorAll('[data-testid="e2eFileUploadStateAndStyle"]')
                    .forEach((host) => this.renderer.setAttribute(host, 'data-e2e-decorated', ''));
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
    selector: 'e2e-file-upload-dropzone',
    imports: [
        KbqButton,
        KbqButtonCssStyler,
        KbqLocalDropzone
    ],
    template: `
        <div class="layout-row">
            <button
                kbq-button
                class="e2e-dropzone-trigger"
                data-testid="e2eLocalDropzoneTrigger"
                (click)="localDropzone().open({ title: 'Local Dropzone', caption: 'caption' })"
            >
                Show Local Dropzone
            </button>
            <button
                kbq-button
                class="e2e-dropzone-trigger"
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

        <span>
            In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to
            make a machine or network resource unavailable to its intended users by temporarily or indefinitely
            disrupting services of a host connected to a network. Denial of service is typically accomplished by
            flooding the targeted machine or resource with superfluous requests in an attempt to overload systems and
            prevent some or all legitimate requests from being fulfilled. The range of attacks varies widely, spanning
            from inundating a server with millions of requests to slow its performance, overwhelming a server with a
            substantial amount of invalid data, to submitting requests with an illegitimate IP address.
        </span>

        <div
            #dropzoneElement
            style="height: 300px; width: 300px"
            data-testid="e2eLocalDropzoneArea"
            kbqLocalDropzone
        ></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-margin-bottom-l layout-column',
        'data-testid': 'e2eFileUploadDropzone'
    }
})
export class E2eFileUploadDropzone {
    protected readonly localDropzone = viewChild.required(KbqLocalDropzone);
    protected readonly fullScreenDropzoneService = inject(KbqFullScreenDropzoneService);
}

@Component({
    selector: 'e2e-file-upload-scrollbar-flash',
    imports: [KbqFileUploadModule],
    template: `
        <kbq-multiple-file-upload
            class="e2e-file-upload"
            data-testid="e2eFileUploadFlashOverflowing"
            [files]="overflowingFiles"
        />

        <kbq-multiple-file-upload
            class="e2e-file-upload"
            data-testid="e2eFileUploadFlashFitting"
            [files]="fittingFiles"
        />
    `,
    styles: `
        :host {
            display: flex;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-m);
        }

        /* The list has no height cap by default (--kbq-file-upload-size-multiple-max-height is unset),
           so it would simply grow to fit every row and never scroll. */
        .e2e-file-upload {
            --kbq-file-upload-size-multiple-max-height: 120px;

            width: 320px;
        }
    `,
    providers: [
        // The reveal lasts hideDelay and nothing brings it back, so the default second would make this
        // a race against page load rather than a test of the behaviour.
        kbqScrollbarOptionsProvider({ hideDelay: 5000 })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eFileUploadScrollbarFlash'
    }
})
export class E2eFileUploadScrollbarFlash {
    // Against the 120px cap the fixture sets: this many rows overflow it, a single one does not.
    protected readonly overflowingFiles: KbqFileItem[] = Array.from({ length: 12 }, (_, index) => ({
        file: new File(['test'] satisfies BlobPart[], `file-${index}.txt`)
    })) satisfies KbqFileItem[];
    protected readonly fittingFiles: KbqFileItem[] = [
        { file: new File(['test'] satisfies BlobPart[], 'file.txt') }
    ] satisfies KbqFileItem[];
}

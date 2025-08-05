import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Directive,
    EventEmitter,
    inject,
    Input,
    Output,
    Renderer2,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    FormArray,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrors,
    Validators
} from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { FileValidators, KbqLocaleServiceModule, ShowOnFormSubmitErrorStateMatcher } from '@koobiq/components/core';
import {
    KBQ_FILE_UPLOAD_CONFIGURATION,
    KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION,
    KbqFileItem,
    KbqFileUploadModule,
    KbqFileValidatorFn,
    KbqMultipleFileUploadComponent
} from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqRadioModule } from '@koobiq/components/radio';
import { interval, takeWhile, timer } from 'rxjs';
import { FileUploadExamplesModule } from '../../docs-examples/components/file-upload';
import { DevLocaleSelector } from '../locale-selector';

const MAX_FILE_SIZE = 5 * 2 ** 20;

const hintMessage = 'file upload hint';

const maxFileExceededFiveMbs = (file: File) => {
    if (!file) return null;

    if (file.size > MAX_FILE_SIZE) {
        return 'Размер файла превышает максимально допустимый (5 МБ)';
    }

    return null;
};

const maxFileSize = (control: AbstractControl): ValidationErrors | null => {
    const kilo = 1024;
    const mega = kilo * kilo;
    const maxMbytes = 5;
    const maxSize = maxMbytes * mega;

    const value: KbqFileItem[] = control.value;
    let result: string | true | null = null;

    if (!value.length) return null;

    for (const fileItem of value) {
        if ((fileItem.file?.size ?? 0) > maxSize) {
            fileItem.hasError = true;
            result = true;
        }
    }

    return { maxFileSize: result };
};

@Directive({
    standalone: true,
    selector: '[devCustomText]',
    providers: [
        {
            provide: KBQ_FILE_UPLOAD_CONFIGURATION,
            useValue: {
                captionText: 'Перетащите сюда или ',
                captionTextWhenSelected: 'Перетащите еще или ',
                captionTextForCompactSize: 'Перетащите файлы или ',
                browseLink: 'выберите',
                title: 'Загрузите фотографии',
                gridHeaders: {
                    file: 'Файл',
                    size: 'Размер'
                }
            }
        }
    ]
})
export class DevCustomTextDirective {}

type SingleUploadCell = {
    file: KbqFileItem | null;
    icon: string;
    disabled?: boolean;
    showFileSize?: boolean;
    className?: string;
};

type MultipleUploadCell = {
    files: KbqFileItem[];
    icon: string;
    disabled?: boolean;
    showFileSize?: boolean;
    className?: string;
    size?: KbqMultipleFileUploadComponent['size'];
    type?: 'error';
};

@Component({
    standalone: true,
    imports: [KbqFileUploadModule, ReactiveFormsModule, KbqIconModule],
    selector: 'dev-file-upload-state-and-style',
    template: `
        <div>
            <table>
                @for (row of singleFileUploadRows; track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td>
                                <kbq-file-upload
                                    [class]="cell.className"
                                    [file]="cell.file"
                                    [showFileSize]="cell.showFileSize ?? true"
                                    [disabled]="!!cell.disabled"
                                >
                                    <i kbq-icon="" [class]="cell.icon"></i>
                                </kbq-file-upload>
                            </td>
                        }
                    </tr>
                }
            </table>
        </div>

        <div>
            <table>
                @for (row of multipleFileUploadRows; track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td>
                                <kbq-multiple-file-upload
                                    [class]="cell.className"
                                    [files]="cell.files"
                                    [disabled]="cell.disabled || false"
                                    [size]="cell.size || 'default'"
                                >
                                    <ng-template #kbqFileIcon>
                                        <i kbq-icon="kbq-file-o_16"></i>
                                    </ng-template>
                                </kbq-multiple-file-upload>
                            </td>
                        }
                    </tr>
                }
            </table>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevFileUploadStateAndStyle {
    private readonly iconClass = { error: 'kbq-info-circle_16', default: 'kbq-file-o_16' };

    protected readonly singleFileUploadRows: SingleUploadCell[][] = [
        // Row 1: Simple (no file selected)
        [
            { file: null, icon: this.iconClass.default },
            { file: null, icon: this.iconClass.default, disabled: true },
            { file: null, icon: this.iconClass.error, className: 'dev-with-error' },
            { file: null, icon: this.iconClass.default, className: 'dev-dragover' }
        ],

        // Row 2: File selected, fileSize shown
        [
            { file: this.testKbqFileItem, icon: this.iconClass.default },
            { file: this.testKbqFileItem, icon: this.iconClass.default, disabled: true },
            { file: this.testKbqFileItem, icon: this.iconClass.error, className: 'dev-with-error' },
            { file: this.testKbqFileItem, icon: this.iconClass.default, className: 'dev-dragover' }
        ],

        // Row 3: File selected, fileSize hidden
        [
            { file: this.testKbqFileItem, icon: this.iconClass.default, showFileSize: false },
            { file: this.testKbqFileItem, icon: this.iconClass.default, showFileSize: false, disabled: true },
            {
                file: this.testKbqFileItem,
                icon: this.iconClass.error,
                showFileSize: false,
                className: 'dev-with-error'
            },
            { file: this.testKbqFileItem, icon: this.iconClass.default, showFileSize: false, className: 'dev-dragover' }
        ]
    ];

    protected readonly multipleFileUploadRows: MultipleUploadCell[][] = [
        // Row 1: No file selected
        [
            { files: [], icon: this.iconClass.default },
            { files: [], icon: this.iconClass.default, disabled: true },
            { files: [], icon: this.iconClass.error, className: 'dev-with-error' },
            { files: [], icon: this.iconClass.default, className: 'dev-dragover' }
        ],
        // Row 2: File selected
        [
            { files: [this.testKbqFileItem], icon: this.iconClass.default },
            { files: [this.testKbqFileItem], icon: this.iconClass.default, disabled: true },
            { files: [this.testKbqFileItem], icon: this.iconClass.error, className: 'dev-with-error' },
            { files: [this.testKbqFileItem], icon: this.iconClass.default, className: 'dev-dragover' }
        ],
        // Row 3: Compact, no file selected
        [
            { files: [], icon: this.iconClass.default, size: 'compact' },
            { files: [], icon: this.iconClass.default, size: 'compact', disabled: true },
            { files: [], icon: this.iconClass.error, size: 'compact', className: 'dev-with-error' },
            { files: [], icon: this.iconClass.default, size: 'compact', className: 'dev-dragover' }
        ],
        // Row 4: File selected, dragover with error
        [{ files: [this.testKbqFileItem], icon: this.iconClass.error, className: 'dev-dragover' }]
    ];

    protected get testKbqFileItem(): KbqFileItem {
        return { file: new File(['test'] satisfies BlobPart[], 'test.file') } satisfies KbqFileItem;
    }

    private readonly renderer = inject(Renderer2);
    private readonly document = inject(DOCUMENT);

    constructor() {
        afterNextRender(() => {
            this.document
                .querySelectorAll('.dev-dragover .kbq-file-upload')
                .forEach((el) => this.renderer.addClass(el, 'dragover'));
            this.document
                .querySelectorAll('.dev-with-error .kbq-file-upload')
                .forEach((el) => this.renderer.addClass(el, 'kbq-error'));
        });

        for (const row of this.multipleFileUploadRows) {
            for (const cell of row) {
                if (cell?.type === 'error') {
                    for (const file of cell.files) {
                        file.hasError = true;
                    }
                }
            }
        }
    }
}

@Component({
    standalone: true,
    imports: [FileUploadExamplesModule],
    selector: 'dev-examples',
    template: `
        <file-upload-cva-overview-example />
        <hr />
        <file-upload-indeterminate-loading-overview-example />
        <hr />
        <file-upload-multiple-compact-overview-example />
        <hr />
        <file-upload-multiple-custom-text-overview-example />
        <hr />
        <file-upload-multiple-default-overview-example />
        <hr />
        <file-upload-multiple-default-validation-reactive-forms-overview-example />
        <hr />
        <file-upload-multiple-error-overview-example />
        <hr />
        <file-upload-multiple-required-reactive-validation-example />
        <hr />
        <file-upload-single-error-overview-example />
        <hr />
        <file-upload-single-overview-example />
        <hr />
        <file-upload-single-required-reactive-validation-example />
        <hr />
        <file-upload-single-validation-reactive-forms-overview-example />
        <hr />
        <file-upload-single-with-signal-example />
        <hr />
        <file-upload-single-accept-validation-example />
        <hr />
        <file-upload-multiple-accept-validation-example />
    `,
    host: {
        class: 'layout-column'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
class DevExamples {}

@Component({
    standalone: true,
    imports: [KbqFileUploadModule, KbqIconModule, KbqFormFieldModule],
    selector: 'dev-file-upload-compact',
    template: `
        <kbq-multiple-file-upload
            size="compact"
            [disabled]="disabled"
            [inputId]="'test-compact'"
            [files]="files"
            (fileQueueChanged)="addedFiles($event)"
        >
            <ng-template #kbqFileIcon>
                <i color="contrast-fade" kbq-icon="kbq-file-o_16"></i>
            </ng-template>
            <kbq-hint>{{ hintMessage }}</kbq-hint>
        </kbq-multiple-file-upload>
    `,
    providers: [
        {
            provide: KBQ_FILE_UPLOAD_CONFIGURATION,
            useValue: {
                ...KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION,
                captionText: KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION.captionTextForCompactSize
            }
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevMultipleFileUploadCompact {
    @Input() disabled: boolean;
    @Input() files: KbqFileItem[] = [];
    @Output() readonly addedFile: EventEmitter<any> = new EventEmitter<any>();

    hintMessage = hintMessage;

    addedFiles(event: KbqFileItem[]) {
        this.addedFile.emit(event);
    }
}

@Component({
    standalone: true,
    imports: [
        DevExamples,
        FileUploadExamplesModule,
        DevLocaleSelector,
        FormsModule,
        ReactiveFormsModule,
        KbqLocaleServiceModule,
        KbqFileUploadModule,
        KbqButtonModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconModule,
        KbqCheckboxModule,
        KbqRadioModule,
        DevMultipleFileUploadCompact,
        DevCustomTextDirective,
        DevFileUploadStateAndStyle
    ],
    selector: 'dev-app',
    templateUrl: 'template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    disabled = false;
    validation: KbqFileValidatorFn[] = [maxFileExceededFiveMbs];
    hintMessage = hintMessage;

    file: KbqFileItem | null;
    files: KbqFileItem[] = [];
    filesForDefaultValidation: KbqFileItem[] = [];

    errorMessagesForSingle: string[] = [];
    errorMessages: string[] = [];
    accept = ['.pdf', '.png'];

    control = new FormControl<KbqFileItem | null>(null, FileValidators.maxFileSize(MAX_FILE_SIZE));
    singleFileControl = new FormControl<KbqFileItem | null>(null, FileValidators.maxFileSize(MAX_FILE_SIZE));

    form = new FormGroup(
        {
            'file-upload': new FormControl<KbqFileItem | null>(null, [
                Validators.required,
                FileValidators.maxFileSize(MAX_FILE_SIZE)])
        },
        { updateOn: 'submit' }
    );

    formMultiple = new FormGroup(
        {
            'file-upload': new FormControl<FileList | KbqFileItem[]>([]),
            'file-list': new FormArray<FormControl<KbqFileItem | null>>([])
        },
        { updateOn: 'submit' }
    );
    fileList = new FormArray<FormControl<KbqFileItem | null>>([]);
    fileListOnAddLoad = new FormArray<FormControl<KbqFileItem | null>>([]);

    secondControl = new FormControl<File | KbqFileItem | null>(null);
    multipleFileUploadControl = new FormControl<FileList | KbqFileItem[]>([], maxFileSize);

    get fileListValidationOnSubmit(): FormArray {
        return this.formMultiple.get('file-list') as FormArray;
    }

    private readonly cdr = inject(ChangeDetectorRef);

    constructor() {
        this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe((value: KbqFileItem | null) => {
            // can be used mapped file item
            // this.secondControl.setValue(value);
            // or even JS file object
            this.secondControl.setValue(value?.file || null);
        });

        this.singleFileControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value: KbqFileItem | null) => {
            if (!value || this.singleFileControl.invalid) return;

            this.initLoading();
        });

        this.fileList.statusChanges.subscribe(() => {
            this.fileList.controls.forEach((control: FormControl<KbqFileItem | null>) => {
                if (control?.value && 'hasError' in control.value) {
                    control.value.hasError = control.invalid;
                }
            });
        });

        this.fileListValidationOnSubmit.statusChanges.subscribe(() => {
            this.fileListValidationOnSubmit.controls.forEach((control) => {
                if (control.invalid) {
                    control.value.hasError = true;
                }
            });
        });

        this.fileListOnAddLoad.statusChanges.subscribe(() => {
            this.fileListOnAddLoad.controls.forEach((control) => {
                if (control?.value && 'hasError' in control.value) {
                    control.value.hasError = control.invalid;
                }
            });
        });
        this.toggleDisabled();
    }

    addFileMultiple(files: KbqFileItem[]) {
        this.files = files;
    }

    checkValidation() {
        this.errorMessagesForSingle = [];

        if (this.file) {
            this.errorMessagesForSingle = this.validation.map((fn) => fn(this.file!.file) || '').filter(Boolean);

            if (this.errorMessagesForSingle.length) {
                this.file = { ...this.file, hasError: true };
            }
        }

        this.cdr.markForCheck();
    }

    onSubmit() {
        this.fileListValidationOnSubmit.controls.forEach((control) => {
            control.setValidators(FileValidators.maxFileSize(MAX_FILE_SIZE));
            control.updateValueAndValidity();
        });
    }

    toggleDisabled() {
        this.disabled = !this.disabled;
        [this.control, this.secondControl, this.form, this.formMultiple, this.multipleFileUploadControl].forEach(
            (control) => (control.enabled ? control.disable() : control.enable())
        );
    }

    startLoading(): void {
        const maxPercent = 100;
        const loadingOffset = 100;

        this.file?.loading?.next(true);

        interval(loadingOffset)
            .pipe(takeWhile((value) => value <= maxPercent))
            .subscribe((value) => this.file?.progress?.next(value));

        this.files.forEach((file, index) => {
            file.loading?.next(true);

            timer(loadingOffset * index, loadingOffset * index)
                .pipe(takeWhile((value) => value <= maxPercent))
                .subscribe((value) => file.progress?.next(value));
        });
    }

    startIndeterminateLoading() {
        this.files.forEach((file) => timer(300).subscribe(() => file.loading?.next(true)));

        timer(5000).subscribe(() => this.files.forEach((file) => file.loading?.next(false)));
    }

    initLoading() {
        const file = this.singleFileControl.value;

        file?.loading?.next(true);

        timer(5000).subscribe(() => file?.loading?.next(false));
    }

    initLoadingForMultiple() {
        const files: KbqFileItem[] = [];

        for (const file of files) {
            file?.loading?.next(true);
        }

        timer(5000).subscribe(() => {
            for (const file of files) {
                file?.loading?.next(false);
            }
        });
    }

    onFileRemoved([
        _,
        index
    ]: [
        KbqFileItem,
        number
    ]) {
        this.fileListValidationOnSubmit.removeAt(index);
        this.fileList.removeAt(index);
        this.fileListOnAddLoad.removeAt(index);
    }

    onFilesAddedForListWithLoadOnAdd($event: KbqFileItem[]) {
        for (const fileItem of $event.slice()) {
            this.fileListOnAddLoad.push(new FormControl(fileItem, FileValidators.maxFileSize(MAX_FILE_SIZE)));
        }

        this.initLoadingForMultiple();
    }

    onFilesAdded($event: KbqFileItem[]) {
        for (const fileItem of $event.slice()) {
            this.fileListValidationOnSubmit.push(new FormControl(fileItem));
        }
    }

    onFileQueueChange($event: KbqFileItem[]) {
        this.filesForDefaultValidation = $event.slice();

        this.errorMessages = [];

        for (const fileItem of this.filesForDefaultValidation) {
            const validationResult = maxFileExceededFiveMbs(fileItem.file);

            if (validationResult) {
                fileItem.hasError = true;
                this.errorMessages.push(`${fileItem.file.name} - maxFileSize`);
            }
        }
    }

    protected readonly showOnFormSubmitErrorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
}

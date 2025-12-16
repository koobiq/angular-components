import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { AsyncPipe, isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
    DoCheck,
    ElementRef,
    EventEmitter,
    inject,
    input,
    Input,
    Output,
    PLATFORM_ID,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ControlValueAccessor } from '@angular/forms';
import { ErrorStateMatcher, KbqDataSizePipe, ruRULocaleData } from '@koobiq/components/core';
import { KbqEllipsisCenterDirective } from '@koobiq/components/ellipsis-center';
import { KbqHint } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqListModule } from '@koobiq/components/list';
import { KbqProgressSpinnerModule, ProgressSpinnerMode } from '@koobiq/components/progress-spinner';
import { BehaviorSubject, skip } from 'rxjs';
import {
    KBQ_FILE_UPLOAD_CONFIGURATION,
    KbqFile,
    KbqFileItem,
    KbqFileUploadBase,
    KbqFileValidatorFn,
    KbqInputFile,
    KbqInputFileLabel
} from './file-upload';
import { KbqFileDropDirective, KbqFileList, KbqFileLoader, KbqFileUploadPrimitive } from './primitives';

let nextMultipleFileUploadUniqueId = 0;

export interface KbqInputFileMultipleLabel extends KbqInputFileLabel {
    captionTextWhenSelected: string;
    captionTextForCompactSize: string;
    gridHeaders: {
        file: string;
        size: string;
    };

    [k: string | number | symbol]: unknown;
}

export const KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION: KbqInputFileMultipleLabel =
    ruRULocaleData.fileUpload.multiple;

const fileSizeCellPadding = 16;

@Component({
    selector: 'kbq-multiple-file-upload,kbq-file-upload[multiple]',
    imports: [
        KbqFileDropDirective,
        KbqIconModule,
        KbqLinkModule,
        KbqListModule,
        KbqDataSizePipe,
        KbqProgressSpinnerModule,
        AsyncPipe,
        NgTemplateOutlet,
        KbqEllipsisCenterDirective,
        KbqFileLoader
    ],
    templateUrl: './multiple-file-upload.component.html',
    styleUrls: ['./file-upload.scss', './file-upload-tokens.scss', './multiple-file-upload.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-multiple-file-upload'
    },
    hostDirectives: [
        {
            directive: KbqFileUploadPrimitive,
            inputs: ['id', 'disabled', 'multiple', 'onlyDirectory']
        },
        KbqFileList

    ]
})
export class KbqMultipleFileUploadComponent
    extends KbqFileUploadBase
    implements AfterViewInit, KbqInputFile, ControlValueAccessor, DoCheck
{
    /**
     * A value responsible for progress spinner type.
     * Loading logic depends on selected mode */
    @Input() progressMode: ProgressSpinnerMode = 'determinate';
    /** Array of file type specifiers */
    @Input() accept?: string[];
    @Input() disabled: boolean;
    /**
     * @deprecated use `FormControl.errors`
     */
    @Input() errors: string[] = [];
    @Input() size: 'compact' | 'default' = 'default';
    /**
     * custom ID for the file input element.
     */
    @Input() inputId: string = `kbq-multiple-file-upload-${nextMultipleFileUploadUniqueId++}`;
    /**
     * @deprecated use FormControl for validation
     */
    @Input() customValidation?: KbqFileValidatorFn[];

    /** An object used to control the error state of the component. */
    @Input() errorStateMatcher: ErrorStateMatcher;

    get files(): KbqFileItem[] {
        return this.fileList.list();
    }

    @Input()
    set files(currentFileList: KbqFileItem[]) {
        this.fileList.list.set(currentFileList);
        this.cvaOnChange(this.files);
    }

    /** Optional configuration to override default labels with localized text.*/
    readonly localeConfig = input<Partial<KbqInputFileMultipleLabel>>();

    /** Emits an event containing updated file list.
     * public output will be renamed to filesChange in next major release (#DS-3700) */
    @Output('fileQueueChanged') readonly filesChange: EventEmitter<KbqFileItem[]> = new EventEmitter<KbqFileItem[]>();
    /**
     * Emits an event containing a chunk of files added to the file list.
     * Useful when handling added files, skipping filtering file list.
     */
    @Output() readonly filesAdded: EventEmitter<KbqFileItem[]> = new EventEmitter<KbqFileItem[]>();
    /**
     * Emits an event containing a tuple of file and file's index when removed from the file list.
     * Useful when handle removed files, skipping filtering file list.
     */
    @Output() readonly fileRemoved: EventEmitter<[KbqFileItem, number]> = new EventEmitter<[KbqFileItem, number]>();

    /** File Icon Template */
    @ContentChild('kbqFileIcon', { static: false, read: TemplateRef })
    protected readonly customFileIcon: TemplateRef<HTMLElement>;

    @ViewChild(KbqFileLoader) protected readonly fileLoader: KbqFileLoader | undefined;
    @ViewChild('fileSizeHeaderCell') private readonly fileSizeHeaderCell: ElementRef<HTMLElement>;

    /** @docs-private */
    @ContentChildren(KbqHint) protected readonly hint: QueryList<TemplateRef<any>>;

    /** @docs-private */
    hasFocus = false;
    /** @docs-private */
    columnDefs: { header: string; cssClass: string }[];
    /** @docs-private */
    config: KbqInputFileMultipleLabel;

    /** @docs-private */
    separatedCaptionText: string[];
    /** @docs-private */
    separatedCaptionTextWhenSelected: string[];
    /** @docs-private */
    separatedCaptionTextForCompactSize: string[];

    /** cvaOnChange function registered via registerOnChange (ControlValueAccessor).
     * @docs-private
     */
    cvaOnChange = (_: KbqFileItem[]) => {};

    /** onTouch function registered via registerOnTouch (ControlValueAccessor).
     * @docs-private */
    onTouched = () => {};

    /** @docs-private */
    get input(): ElementRef<HTMLInputElement> | undefined {
        return this.fileLoader?.input();
    }

    /** @docs-private */
    get acceptedFiles(): string {
        return this.accept?.join(',') || '*/*';
    }

    /**
     * @deprecated use `FormControl.errors`
     */
    get hasErrors(): boolean {
        return this.errors && !!this.errors.length;
    }

    /** @docs-private */
    get hasHint(): boolean {
        return this.hint.length > 0;
    }

    /**
     * Indicates an invalid state based on `errorState`,
     * applying a CSS class in HTML for visual feedback.
     * @docs-private
     */
    get invalid(): boolean {
        return this.errorState;
    }

    /**
     * Set maxWidth for filesize cell to enable proper ellipsis center,
     * @docs-private
     */
    protected get fileSizeCellMaxWidth() {
        return this.fileSizeHeaderCell?.nativeElement.offsetWidth - fileSizeCellPadding;
    }

    /** @docs-private */
    readonly configuration = inject<KbqInputFileMultipleLabel>(KBQ_FILE_UPLOAD_CONFIGURATION, {
        optional: true
    });

    protected readonly fileList = inject(KbqFileList, { host: true });
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly platformId = inject(PLATFORM_ID);

    constructor() {
        super();
        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!this.localeService) {
            this.initDefaultParams();
        }

        if (this.ngControl) {
            // Note: we provide the value accessor through here, instead of
            // the `providers` to avoid running into a circular import.
            this.ngControl.valueAccessor = this;
        }

        toObservable(this.localeConfig)
            .pipe(skip(1), takeUntilDestroyed())
            .subscribe(() => (this.localeService ? this.updateLocaleParams() : this.initDefaultParams()));
    }

    ngDoCheck() {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
            this.updateErrorState();
        }
    }

    ngAfterViewInit() {
        // FormControl specific errors update
        this.ngControl?.statusChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.errors = Object.values(this.ngControl?.errors || {});
            this.cdr.markForCheck();
        });

        this.stateChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cdr.markForCheck());
    }

    /** Implemented as part of ControlValueAccessor.
     * @docs-private */
    writeValue(files: FileList | KbqFileItem[] | null): void {
        // @TODO: remove FileList from arguments since it redundant. It resolves SSR (#DS-4414)
        if (!isPlatformBrowser(this.platformId)) return;

        this.files = files instanceof FileList || !files ? this.mapToFileItem(files) : files;
        this.filesChange.emit(this.files);
    }

    /** Implemented as part of ControlValueAccessor.
     * @docs-private */
    registerOnChange(fn: any): void {
        this.cvaOnChange = fn;
    }

    /** Implemented as part of ControlValueAccessor.
     * @docs-private */
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    /**
     * Sets the disabled state of the control. Implemented as a part of ControlValueAccessor.
     * @param isDisabled Whether the control should be disabled.
     * @docs-private
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.cdr.markForCheck();
    }

    /** @docs-private */
    onFileSelectedViaClick({ target }: Event) {
        if (this.disabled) return;

        const filesToAdd = this.mapToFileItem((target as HTMLInputElement).files);

        this.onFileAdded(filesToAdd);
        // allows the same file selection every time user clicks on the control.
        this.renderer.setProperty(target, 'value', null);
    }

    /** @docs-private */
    onFileDropped(files: KbqFile[]) {
        if (this.disabled) return;

        const filesToAdd = this.mapToFileItem(files);

        this.onFileAdded(filesToAdd);
    }

    /** @docs-private */
    deleteFile(index: number, event?: MouseEvent, origin?: FocusOrigin): void {
        if (this.disabled) return;

        event?.stopPropagation();

        const removedFile = this.fileList.removeAt(index)[0];

        this.cvaOnChange(this.files);

        this.fileRemoved.emit([removedFile, index]);
        this.filesChange.emit(this.files);
        this.onTouched();

        if (this.files.length === 0) {
            setTimeout(() => {
                const input = this.input?.nativeElement;

                if (input) {
                    this.focusMonitor.focusVia(input, origin ?? 'keyboard');
                }
            });

            return;
        }
    }

    private updateLocaleParams = () => {
        this.config = this.buildConfig(this.configuration || this.localeService?.getParams('fileUpload').multiple);

        this.columnDefs = [
            { header: this.config.gridHeaders.file, cssClass: 'file' },
            { header: this.config.gridHeaders.size, cssClass: 'size' },
            { header: '', cssClass: 'action' }
        ];

        this.getCaptionText();

        this.cdr.markForCheck();
    };

    private mapToFileItem(files: FileList | KbqFile[] | null): KbqFileItem[] {
        if (!files) {
            return [];
        }

        return Array.from(files).map((file: File) => ({
            file,
            hasError: this.validateFile(file),
            loading: new BehaviorSubject<boolean>(false),
            progress: new BehaviorSubject<number>(0)
        }));
    }

    private validateFile(file: File): boolean | undefined {
        if (!this.customValidation?.length) {
            return;
        }

        const errorsPerFile = this.customValidation
            .reduce((errors: (string | null)[], validatorFn: KbqFileValidatorFn) => {
                errors.push(validatorFn(file));

                return errors;
            }, [])
            .filter(Boolean) as string[];

        this.errors = [
            ...this.errors,
            ...errorsPerFile
        ];

        return !!errorsPerFile.length;
    }

    private initDefaultParams() {
        this.config = this.buildConfig(KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION);

        this.columnDefs = [
            { header: this.config.gridHeaders.file, cssClass: 'file' },
            { header: this.config.gridHeaders.size, cssClass: 'size' },
            { header: '', cssClass: 'action' }
        ];

        this.getCaptionText();
    }

    private getCaptionText() {
        this.separatedCaptionText = this.config.captionText.split('{{ browseLink }}');
        this.separatedCaptionTextWhenSelected = this.config.captionTextWhenSelected.split('{{ browseLink }}');
        this.separatedCaptionTextForCompactSize = this.config.captionTextForCompactSize.split('{{ browseLink }}');
    }

    private onFileAdded(filesToAdd: KbqFileItem[]) {
        this.fileList.addArray(filesToAdd);

        this.cvaOnChange(this.files);

        this.filesAdded.emit(filesToAdd);
        this.filesChange.emit(this.files);
        this.onTouched();
    }
}

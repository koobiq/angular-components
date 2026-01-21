import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { AsyncPipe, isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    ContentChild,
    ContentChildren,
    DoCheck,
    effect,
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
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor } from '@angular/forms';
import {
    ErrorStateMatcher,
    KBQ_DEFAULT_LOCALE_ID,
    KbqDataSizePipe,
    KbqEnumValues,
    KbqMultipleFileUploadLocaleConfig,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqEllipsisCenterDirective } from '@koobiq/components/ellipsis-center';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqHint } from '@koobiq/components/form-field';
import { KbqIcon, KbqIconButton } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';
import { KbqListModule } from '@koobiq/components/list';
import { KbqProgressSpinnerModule, ProgressSpinnerMode } from '@koobiq/components/progress-spinner';
import { BehaviorSubject, of } from 'rxjs';
import { KbqFullScreenDropzoneService } from './dropzone';
import {
    KBQ_FILE_UPLOAD_CONFIGURATION,
    KbqFile,
    KbqFileItem,
    KbqFileUploadAllowedType,
    KbqFileUploadBase,
    KbqFileUploadCaptionContext,
    KbqFileValidatorFn
} from './file-upload';
import { KbqFileDropDirective, KbqFileList, KbqFileLoader, KbqFileUploadContext } from './primitives';

let nextMultipleFileUploadUniqueId = 0;

export interface KbqInputFileMultipleLabel extends KbqMultipleFileUploadLocaleConfig {
    [k: string | number | symbol]: unknown;
}

export const KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION: KbqMultipleFileUploadLocaleConfig =
    ruRULocaleData.fileUpload.multiple;

@Component({
    selector: 'kbq-multiple-file-upload,kbq-file-upload[multiple]',
    imports: [
        AsyncPipe,
        NgTemplateOutlet,
        KbqFileDropDirective,
        KbqIconButton,
        KbqIcon,
        KbqLink,
        KbqListModule,
        KbqDataSizePipe,
        KbqProgressSpinnerModule,
        KbqEllipsisCenterDirective,
        KbqFileLoader,
        KbqEmptyStateModule
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
            directive: KbqFileUploadContext,
            inputs: ['id', 'disabled']
        },
        { directive: KbqFileList, outputs: ['listChange: filesChange', 'itemsAdded', 'itemRemoved'] }
    ],
    providers: [KbqFullScreenDropzoneService]
})
export class KbqMultipleFileUploadComponent
    extends KbqFileUploadBase
    implements AfterViewInit, ControlValueAccessor, DoCheck
{
    /**
     * A value responsible for progress spinner type.
     * Loading logic depends on selected mode */
    @Input() progressMode: ProgressSpinnerMode = 'determinate';
    /** Array of file type specifiers */
    @Input() accept?: string[];
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

    /**
     * Determines which kind of items the upload component can accept.
     * @default mixed
     */
    allowed = input<KbqEnumValues<KbqFileUploadAllowedType>>(KbqFileUploadAllowedType.File);

    fullScreenDropZone = input<boolean>(false);

    /** Optional configuration to override default labels with localized text.*/
    readonly localeConfig = input<Partial<KbqMultipleFileUploadLocaleConfig>>();

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

    /** @docs-private */
    @ContentChildren(KbqHint) protected readonly hint: QueryList<TemplateRef<any>>;

    /** @docs-private */
    hasFocus = false;

    /** @docs-private */
    readonly resolvedLocaleConfig = computed<KbqMultipleFileUploadLocaleConfig>(() => {
        const localeId = this.localeId();
        const localeConfig = this.localeConfig();

        const defaultLocaleConfig: KbqMultipleFileUploadLocaleConfig =
            this.localeService && localeId
                ? this.localeService.getParams('fileUpload').multiple
                : KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION;

        const baseLocaleConfig: KbqMultipleFileUploadLocaleConfig = this.configuration || defaultLocaleConfig;

        return { ...baseLocaleConfig, ...localeConfig };
    });

    /** @docs-private */
    protected readonly captionContext = computed<KbqFileUploadCaptionContext>(() => {
        const config = this.resolvedLocaleConfig();

        switch (this.allowed()) {
            case KbqFileUploadAllowedType.Mixed: {
                const [before, after] = config.captionTextWithFolder.split('{{ browseLink }}');

                const [captionTextSeparator] = after.split('{{ browseLinkFolderMixed }}');

                return {
                    captionText: before,
                    browseLink: config.browseLink,
                    captionTextSeparator,
                    browseLinkFolder: config.browseLinkFolderMixed
                };
            }
            case KbqFileUploadAllowedType.Folder: {
                const [before] = config.captionTextOnlyFolder.split('{{ browseLinkFolder }}');

                return { captionText: before, browseLinkFolder: config.browseLinkFolder };
            }
            case KbqFileUploadAllowedType.File:
            default: {
                const caption = this.size === 'compact' ? config.captionTextForCompactSize : config.captionText;
                const [before] = caption.split('{{ browseLink }}');

                return { captionText: before, browseLink: config.browseLink };
            }
        }
    });

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

    /** @docs-private */
    protected get captionTextWhenSelected(): string {
        return this.resolvedLocaleConfig().captionTextWhenSelected.split('{{ browseLink }}')[0];
    }

    /** @docs-private */
    readonly configuration = inject<KbqMultipleFileUploadLocaleConfig>(KBQ_FILE_UPLOAD_CONFIGURATION, {
        optional: true
    });

    private readonly localeId = toSignal(this.localeService?.changes.asObservable() ?? of(KBQ_DEFAULT_LOCALE_ID));

    private readonly focusMonitor = inject(FocusMonitor);
    private readonly platformId = inject(PLATFORM_ID);

    constructor() {
        super();

        if (this.ngControl) {
            // Note: we provide the value accessor through here, instead of
            // the `providers` to avoid running into a circular import.
            this.ngControl.valueAccessor = this;
        }

        this.dropzoneService.filesDropped.subscribe((files) => this.onFileDropped(files));

        effect(() => {
            if (this.fullScreenDropZone()) {
                this.dropzoneService.init({ title: 'Перетащите файл', caption: 'test', size: 'normal' });
            } else {
                this.dropzoneService.stop();
            }
        });
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
        this.fileUploadContext.disabled.set(isDisabled);
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

    private onFileAdded(filesToAdd: KbqFileItem[]) {
        this.fileList.addArray(filesToAdd);

        this.cvaOnChange(this.files);

        this.filesAdded.emit(filesToAdd);
        this.filesChange.emit(this.files);
        this.onTouched();
    }
}

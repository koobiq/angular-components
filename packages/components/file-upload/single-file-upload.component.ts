import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { AsyncPipe, isPlatformBrowser } from '@angular/common';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
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
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControlStatus } from '@angular/forms';
import { ErrorStateMatcher, KbqDataSizePipe, KbqFileUploadLocaleConfig, ruRULocaleData } from '@koobiq/components/core';
import { KbqDynamicTranslation, KbqDynamicTranslationSlot } from '@koobiq/components/dynamic-translation';
import { KbqEllipsisCenterDirective } from '@koobiq/components/ellipsis-center';
import { KbqHint } from '@koobiq/components/form-field';
import { KbqIcon, KbqIconButton } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';
import { KbqProgressSpinner, ProgressSpinnerMode } from '@koobiq/components/progress-spinner';
import { BehaviorSubject, skip } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import {
    KBQ_FILE_UPLOAD_CONFIGURATION,
    KbqFile,
    KbqFileItem,
    KbqFileUploadBase,
    KbqFileValidatorFn,
    KbqInputFileLabel
} from './file-upload';
import { KbqFileDropDirective, KbqFileList, KbqFileLoader, KbqFileUploadContext } from './primitives';

let nextSingleFileUploadUniqueId = 0;

export const KBQ_SINGLE_FILE_UPLOAD_DEFAULT_CONFIGURATION: KbqFileUploadLocaleConfig['single'] =
    ruRULocaleData.fileUpload.single;

@Component({
    selector: 'kbq-single-file-upload,kbq-file-upload:not([multiple])',
    imports: [
        AsyncPipe,
        KbqFileDropDirective,
        KbqLink,
        KbqIcon,
        KbqIconButton,
        KbqProgressSpinner,
        KbqEllipsisCenterDirective,
        KbqDataSizePipe,
        KbqFileLoader,
        KbqDynamicTranslation,
        KbqDynamicTranslationSlot
    ],
    templateUrl: './single-file-upload.component.html',
    styleUrls: ['./file-upload.scss', './file-upload-tokens.scss', './single-file-upload.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-single-file-upload'
    },
    hostDirectives: [
        {
            directive: KbqFileUploadContext,
            inputs: ['id', 'disabled', 'multiple', 'onlyDirectory']
        },
        { directive: KbqFileList, outputs: ['listChange: fileChange'] }
    ]
})
export class KbqSingleFileUploadComponent
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
    @Input() inputId: string = `kbq-single-file-upload-${nextSingleFileUploadUniqueId++}`;
    /**
     * @deprecated use FormControl for validation
     */
    @Input() customValidation?: KbqFileValidatorFn[];

    /** An object used to control the error state of the component. */
    @Input() errorStateMatcher: ErrorStateMatcher;

    @Input()
    get file(): KbqFileItem | null {
        const files = this.fileList.list();

        return files.length === 0 ? null : files[0];
    }

    set file(currentFile: KbqFileItem | null) {
        this.fileList.list.set(currentFile === null ? [] : [currentFile]);
        this.cvaOnChange(currentFile);
        this.cdr.markForCheck();
    }

    /**
     * Controls whether to display the file size information.
     * @default true
     */
    @Input({ transform: booleanAttribute }) showFileSize: boolean = true;

    /** Optional configuration to override default labels with localized text.*/
    readonly localeConfig = input<Partial<KbqInputFileLabel>>();

    /** Emits an event containing updated file.
     * public output will be renamed to fileChange in next major release (#DS-3700) */
    @Output('fileQueueChange') readonly fileChange: EventEmitter<KbqFileItem | null> =
        new EventEmitter<KbqFileItem | null>();

    /** @docs-private */
    @ViewChild(KbqFileLoader) protected readonly fileLoader: KbqFileLoader | undefined;

    /** @docs-private */
    @ContentChildren(KbqHint) private readonly hint: QueryList<KbqHint>;

    /** @docs-private */
    config: KbqFileUploadLocaleConfig['single'];
    /** @docs-private */
    separatedCaptionText: string[];

    /** cvaOnChange function registered via registerOnChange (ControlValueAccessor).
     * @docs-private
     */
    cvaOnChange = (_: KbqFileItem | null) => {};

    /** onTouch function registered via registerOnTouch (ControlValueAccessor).
     * @docs-private
     */
    onTouched = () => {};

    /** @docs-private */
    get input(): ElementRef<HTMLInputElement> | undefined {
        return this.fileLoader?.input();
    }

    /** @docs-private */
    get acceptedFiles(): string {
        return this.accept?.join(',') || '*/*';
    }

    /** @docs-private */
    get hasHint(): boolean {
        return this.hint.length > 0;
    }

    /**
     * Indicates an invalid state based on file errors or `errorState`,
     * applying a CSS class in HTML for visual feedback.
     * @docs-private
     */
    get invalid(): boolean {
        return !!this.file?.hasError || this.errorState;
    }

    /** @docs-private */
    readonly configuration: KbqInputFileLabel | null = inject(KBQ_FILE_UPLOAD_CONFIGURATION, {
        optional: true
    });

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
            .subscribe(() => {
                this.localeService ? this.updateLocaleParams() : this.initDefaultParams();
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
        this.ngControl?.statusChanges
            ?.pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
            .subscribe((status: FormControlStatus) => {
                const file = this.file;

                if (file) {
                    file.hasError = status === 'INVALID';
                }

                this.errors = Object.values(this.ngControl?.errors || {});
                this.cdr.markForCheck();
            });

        this.stateChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cdr.markForCheck());
    }

    /** Implemented as part of ControlValueAccessor.
     * @docs-private */
    writeValue(file: File | KbqFileItem | null): void {
        // @TODO: remove File from arguments since it redundant. It resolves SSR (#DS-4414)
        if (!isPlatformBrowser(this.platformId)) return;

        this.file = file instanceof File ? this.mapToFileItem(file) : file;
        this.fileChange.emit(this.file);
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
    onFileSelectedViaClick({ target }: Event): void {
        if (this.disabled) return;

        const fileToAdd = (target as HTMLInputElement).files?.item(0);

        if (fileToAdd) {
            this.file = this.mapToFileItem(fileToAdd);
            this.fileChange.emit(this.file);
        }

        this.onTouched();
        // allows the same file selection every time user clicks on the control.
        this.renderer.setProperty(target, 'value', null);
    }

    /** @docs-private */
    onFileDropped(files: KbqFile[]): void {
        if (this.disabled) return;

        if (files?.length) {
            this.file = this.mapToFileItem(files[0]);
            this.fileChange.emit(this.file);
        }

        // mark as touched after file drop even if file wasn't correct
        this.onTouched();
    }

    /** @docs-private */
    deleteItem(event?: MouseEvent, origin?: FocusOrigin): void {
        if (this.disabled) return;

        event?.stopPropagation();
        this.file = null;
        this.fileChange.emit(this.file);
        this.errors = [];
        // mark as touched after file drop even if file wasn't correct
        this.onTouched();

        if (this.file === null) {
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

        this.getCaptionText();

        this.cdr.markForCheck();
    };

    private mapToFileItem(file: File): KbqFileItem {
        return {
            file,
            hasError: this.validateFile(file),
            progress: new BehaviorSubject<number>(0),
            loading: new BehaviorSubject<boolean>(false)
        };
    }

    private validateFile(file: File): boolean | undefined {
        if (!this.customValidation?.length) return;

        this.errors = this.customValidation
            .reduce((errors: (string | null)[], validatorFn: KbqFileValidatorFn) => {
                errors.push(validatorFn(file));

                return errors;
            }, [])
            .filter(Boolean) as string[];

        return !!this.errors.length;
    }

    private initDefaultParams() {
        this.config = this.buildConfig(KBQ_SINGLE_FILE_UPLOAD_DEFAULT_CONFIGURATION);

        this.getCaptionText();
    }

    private getCaptionText() {
        this.separatedCaptionText = this.config.captionText.split('{{ browseLink }}');
    }
}

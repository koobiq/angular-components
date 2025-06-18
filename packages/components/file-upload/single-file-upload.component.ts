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
    Input,
    Output,
    QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControlStatus } from '@angular/forms';
import { ErrorStateMatcher, ruRULocaleData } from '@koobiq/components/core';
import { KbqHint } from '@koobiq/components/form-field';
import { ProgressSpinnerMode } from '@koobiq/components/progress-spinner';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import {
    isCorrectExtension,
    KBQ_FILE_UPLOAD_CONFIGURATION,
    KbqFile,
    KbqFileItem,
    KbqFileUploadBase,
    KbqFileValidatorFn,
    KbqInputFile,
    KbqInputFileLabel
} from './file-upload';

let nextSingleFileUploadUniqueId = 0;

export const KBQ_SINGLE_FILE_UPLOAD_DEFAULT_CONFIGURATION: KbqInputFileLabel = ruRULocaleData.fileUpload.single;

@Component({
    selector: 'kbq-single-file-upload,kbq-file-upload:not([multiple])',
    templateUrl: './single-file-upload.component.html',
    styleUrls: ['./file-upload.scss', './file-upload-tokens.scss', './single-file-upload.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-single-file-upload'
    }
})
export class KbqSingleFileUploadComponent
    extends KbqFileUploadBase
    implements AfterViewInit, KbqInputFile, ControlValueAccessor, DoCheck
{
    /**
     * A value responsible for progress spinner type.
     * Loading logic depends on selected mode */
    @Input() progressMode: ProgressSpinnerMode = 'determinate';
    /** Array of file type specifiers */
    @Input() accept?: string[];
    @Input() disabled: boolean = false;
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

    private _file: KbqFileItem | null = null;

    @Input()
    get file(): KbqFileItem | null {
        return this._file;
    }

    set file(currentFile: KbqFileItem | null) {
        this._file = currentFile;
        this.cvaOnChange(this._file);
        this.cdr.markForCheck();
    }

    /**
     * Controls whether to display the file size information.
     * @default true
     */
    @Input({ transform: booleanAttribute }) showFileSize: boolean = true;

    /** Emits an event containing updated file.
     * public output will be renamed to fileChange in next major release (#DS-3700) */
    @Output('fileQueueChange') fileChange: EventEmitter<KbqFileItem | null> = new EventEmitter<KbqFileItem | null>();

    /** @docs-private */
    @ViewChild('input') input: ElementRef<HTMLInputElement>;

    /** @docs-private */
    @ContentChildren(KbqHint) private readonly hint: QueryList<KbqHint>;

    /** @docs-private */
    config: KbqInputFileLabel;
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
    }

    ngAfterViewInit() {
        // FormControl specific errors update
        this.ngControl?.statusChanges
            ?.pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
            .subscribe((status: FormControlStatus) => {
                if (this._file) {
                    this._file.hasError = status === 'INVALID';
                }

                this.errors = Object.values(this.ngControl?.errors || {});
                this.cdr.markForCheck();
            });

        this.stateChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cdr.markForCheck());
    }

    ngDoCheck() {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
            this.updateErrorState();
        }
    }

    /** Implemented as part of ControlValueAccessor.
     * @docs-private */
    writeValue(file: File | KbqFileItem | null): void {
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
        this.disabled = isDisabled;
        this.cdr.markForCheck();
    }

    /** @docs-private */
    onFileSelectedViaClick({ target }: Event): void {
        if (this.disabled) {
            return;
        }

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
    deleteItem(event?: MouseEvent): void {
        if (this.disabled) return;

        event?.stopPropagation();
        this.file = null;
        this.fileChange.emit(this.file);
        this.errors = [];
        // mark as touched after file drop even if file wasn't correct
        this.onTouched();
    }

    /** @docs-private */
    onFileDropped(files: FileList | KbqFile[]): void {
        if (this.disabled) {
            return;
        }

        if (files?.length && isCorrectExtension(files[0], this.accept)) {
            this.file = this.mapToFileItem(files[0]);
            this.fileChange.emit(this.file);
        }

        // mark as touched after file drop even if file wasn't correct
        this.onTouched();
    }

    private updateLocaleParams = () => {
        this.config = this.configuration || this.localeService?.getParams('fileUpload').multiple;

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
        this.config = KBQ_SINGLE_FILE_UPLOAD_DEFAULT_CONFIGURATION;

        this.getCaptionText();
    }

    private getCaptionText() {
        this.separatedCaptionText = this.config.captionText.split('{{ browseLink }}');
    }
}

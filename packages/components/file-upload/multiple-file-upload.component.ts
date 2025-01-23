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
    Input,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor } from '@angular/forms';
import { CanDisable, ErrorStateMatcher, ruRULocaleData } from '@koobiq/components/core';
import { KbqHint } from '@koobiq/components/form-field';
import { ProgressSpinnerMode } from '@koobiq/components/progress-spinner';
import { BehaviorSubject } from 'rxjs';
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

@Component({
    selector: 'kbq-multiple-file-upload,kbq-file-upload[multiple]',
    templateUrl: './multiple-file-upload.component.html',
    styleUrls: ['./file-upload.scss', './file-upload-tokens.scss', './multiple-file-upload.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-multiple-file-upload'
    }
})
export class KbqMultipleFileUploadComponent
    extends KbqFileUploadBase
    implements AfterViewInit, KbqInputFile, CanDisable, ControlValueAccessor, DoCheck
{
    /**
     * A value responsible for progress spinner type.
     * Loading logic depends on selected mode */
    @Input() progressMode: ProgressSpinnerMode = 'determinate';
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

    private _files: KbqFileItem[] = [];

    get files(): KbqFileItem[] {
        return this._files;
    }

    @Input()
    set files(currentFileList: KbqFileItem[]) {
        this._files = currentFileList;
        this.cvaOnChange(this._files);
        this.fileQueueChanged.emit(this._files);
        this.cdr.markForCheck();
    }

    @Output() fileQueueChanged: EventEmitter<KbqFileItem[]> = new EventEmitter<KbqFileItem[]>();

    /**
     * Emits an event containing a chunk of files added to the file list.
     */
    @Output() filesAdded: EventEmitter<KbqFileItem[]> = new EventEmitter<KbqFileItem[]>();
    /**
     * Emits an event containing a file and file's index when removed from the file list.
     */
    @Output() fileRemoved: EventEmitter<[KbqFileItem, number]> = new EventEmitter<[KbqFileItem, number]>();

    @ContentChild('kbqFileIcon', { static: false, read: TemplateRef }) customFileIcon: TemplateRef<HTMLElement>;

    @ViewChild('input') input: ElementRef<HTMLInputElement>;

    @ContentChildren(KbqHint) protected readonly hint: QueryList<TemplateRef<any>>;

    hasFocus = false;
    columnDefs: { header: string; cssClass: string }[];

    config: KbqInputFileMultipleLabel;

    separatedCaptionText: string[];
    separatedCaptionTextWhenSelected: string[];
    separatedCaptionTextForCompactSize: string[];

    /** cvaOnChange function registered via registerOnChange (ControlValueAccessor).
     * @docs-private
     */
    cvaOnChange = (_: KbqFileItem[]) => {};

    /** onTouch function registered via registerOnTouch (ControlValueAccessor).
     * @docs-private */
    onTouched = () => {};

    get acceptedFiles(): string {
        return this.accept?.join(',') || '*/*';
    }

    /**
     * @deprecated use `FormControl.errors`
     */
    get hasErrors(): boolean {
        return this.errors && !!this.errors.length;
    }

    get hasHint(): boolean {
        return this.hint.length > 0;
    }

    /**
     * Indicates an invalid state based on `errorState`,
     * applying a CSS class in HTML for visual feedback.
     */
    get invalid(): boolean {
        return this.errorState;
    }

    readonly configuration = inject<KbqInputFileMultipleLabel>(KBQ_FILE_UPLOAD_CONFIGURATION, {
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
        this.ngControl?.statusChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
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
    writeValue(files: FileList | KbqFileItem[] | null): void {
        if (files instanceof FileList || !files) {
            this.files = this.mapToFileItem(files);
        } else {
            this.files = files;
        }
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

    onFileSelectedViaClick({ target }: Event) {
        if (this.disabled) {
            return;
        }

        const filesToAdd = this.mapToFileItem((target as HTMLInputElement).files);

        this.files = [
            ...this.files,
            ...filesToAdd
        ];
        this.filesAdded.emit(filesToAdd);
        this.onTouched();
        /* even if the user selects the same file,
                 the onchange event will be triggered every time user clicks on the control.*/
        this.renderer.setProperty(this.input.nativeElement, 'value', null);
    }

    onFileDropped(files: FileList | KbqFile[]) {
        if (this.disabled) {
            return;
        }

        const filesToAdd = this.mapToFileItem(files);

        this.files = [
            ...this.files,
            ...filesToAdd
        ];
        this.filesAdded.emit(filesToAdd);
        this.onTouched();
    }

    deleteFile(index: number, event?: MouseEvent) {
        if (this.disabled) {
            return;
        }

        event?.stopPropagation();
        this.fileRemoved.emit([this.files[index], index]);
        this.files.splice(index, 1);
        this.files = [...this.files];
        this.onTouched();
    }

    onFileListChange(): void {
        this.fileQueueChanged.emit(this.files);
    }

    private updateLocaleParams = () => {
        this.config = this.configuration || this.localeService?.getParams('fileUpload').multiple;

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

        return Array.from(files)
            .filter((file) => isCorrectExtension(file, this.accept))
            .map((file: File) => ({
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
        this.config = KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION;

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
}

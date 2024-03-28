import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    Optional,
    Output,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    CanDisable,
    KBQ_LOCALE_SERVICE,
    KbqLocaleService,
    ruRULocaleData
} from '@koobiq/components/core';
import { BehaviorSubject } from 'rxjs';

import {
    KBQ_FILE_UPLOAD_CONFIGURATION,
    KbqFile,
    KbqFileItem,
    KbqFileValidatorFn,
    KbqInputFile,
    KbqInputFileLabel,
    isCorrectExtension
} from './file-upload';
import { ProgressSpinnerMode } from '@koobiq/components/progress-spinner';


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
    styleUrls: ['./file-upload.scss', './multiple-file-upload.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-multiple-file-upload'
    }
})
export class KbqMultipleFileUploadComponent implements KbqInputFile, CanDisable {
    /**
     * A value responsible for progress spinner type.
     * Loading logic depends on selected mode */
    @Input() progressMode: ProgressSpinnerMode = 'determinate';
    @Input() accept?: string[];
    @Input() disabled: boolean;
    @Input() errors: string[] = [];
    @Input() files: KbqFileItem[] = [];
    @Input() size: 'compact' | 'default' = 'default';
    @Input() inputId: string = `kbq-multiple-file-upload-${nextMultipleFileUploadUniqueId++}`;
    @Input() customValidation?: KbqFileValidatorFn[];
    @Output() fileQueueChanged: EventEmitter<KbqFileItem[]> = new EventEmitter<KbqFileItem[]>();

    @ContentChild('kbqFileIcon', { static: false, read: TemplateRef }) customFileIcon: TemplateRef<HTMLElement>;

    @ViewChild('input') input: ElementRef<HTMLInputElement>;

    hasFocus = false;
    columnDefs: { header: string; cssClass: string }[];

    config: KbqInputFileMultipleLabel;

    separatedCaptionText: string[];
    separatedCaptionTextWhenSelected: string[];
    separatedCaptionTextForCompactSize: string[];

    get acceptedFiles(): string {
        return this.accept?.join(',') || '*/*';
    }

    get hasErrors(): boolean {
        return this.errors && !!this.errors.length;
    }

    constructor(
        private cdr: ChangeDetectorRef,
        private renderer: Renderer2,
        @Optional() @Inject(KBQ_FILE_UPLOAD_CONFIGURATION) public readonly configuration: KbqInputFileMultipleLabel,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) private localeService?: KbqLocaleService
    ) {
        this.localeService?.changes
            .subscribe(this.updateLocaleParams);

        if (!localeService) {
            this.initDefaultParams();
        }
    }

    onFileSelectedViaClick({ target }: Event) {
        if (this.disabled) { return; }

        this.files = [
            ...this.files,
            ...this.mapToFileItem((target as HTMLInputElement).files)
        ];
        /* even if the user selects the same file,
                 the onchange event will be triggered every time user clicks on the control.*/
        this.renderer.setProperty(this.input.nativeElement, 'value', null);
        this.onFileListChange();
    }

    onFileDropped(files: FileList | KbqFile[]) {
        if (this.disabled) { return; }

        this.files = [...this.files, ...this.mapToFileItem(files)];
        this.onFileListChange();
    }

    deleteFile(index: number, event?: MouseEvent) {
        if (this.disabled) { return; }

        event?.stopPropagation();
        this.files.splice(index, 1);
        this.files = [...this.files];
        this.onFileListChange();
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
    }

    private mapToFileItem(files: FileList | KbqFile[] | null): KbqFileItem[] {
        if (!files) { return []; }

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
        if (!this.customValidation?.length) { return; }

        const errorsPerFile = this.customValidation.reduce(
            (errors: (string | null)[], validatorFn: KbqFileValidatorFn) => {
                errors.push(validatorFn(file));

                return errors;
            },
            []).filter(Boolean) as string[];

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
        this.separatedCaptionTextForCompactSize = this.config.captionTextForCompactSize
            .split('{{ browseLink }}');
    }
}

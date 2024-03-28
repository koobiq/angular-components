import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    Optional,
    Output,
    Renderer2,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    CanDisable, KBQ_LOCALE_SERVICE, KbqLocaleService,
    ruRULocaleData
} from '@koobiq/components/core';
import { BehaviorSubject } from 'rxjs';

import {
    isCorrectExtension,
    KBQ_FILE_UPLOAD_CONFIGURATION,
    KbqFile,
    KbqFileItem,
    KbqFileValidatorFn,
    KbqInputFile,
    KbqInputFileLabel
} from './file-upload';
import { ProgressSpinnerMode } from '@koobiq/components/progress-spinner';


let nextSingleFileUploadUniqueId = 0;

export const KBQ_SINGLE_FILE_UPLOAD_DEFAULT_CONFIGURATION: KbqInputFileLabel =
    ruRULocaleData.fileUpload.single;


@Component({
    selector: 'kbq-single-file-upload,kbq-file-upload:not([multiple])',
    templateUrl: './single-file-upload.component.html',
    styleUrls: ['./file-upload.scss', './single-file-upload.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-single-file-upload'
    }
})
export class KbqSingleFileUploadComponent implements KbqInputFile, CanDisable {
    /**
     * A value responsible for progress spinner type.
     * Loading logic depends on selected mode */
    @Input() progressMode: ProgressSpinnerMode = 'determinate';
    @Input() accept?: string[];
    @Input() disabled: boolean = false;
    @Input() errors: string[] = [];
    @Input() file: KbqFileItem | null = null;
    @Input() inputId: string = `kbq-single-file-upload-${nextSingleFileUploadUniqueId++}`;
    @Input() customValidation?: KbqFileValidatorFn[];
    @Output() fileQueueChange: EventEmitter<KbqFileItem | null> = new EventEmitter<KbqFileItem | null>();

    @ViewChild('input') input: ElementRef<HTMLInputElement>;

    config: KbqInputFileLabel;

    separatedCaptionText: string[];

    get acceptedFiles(): string {
        return this.accept?.join(',') || '*/*';
    }

    constructor(
        private cdr: ChangeDetectorRef,
        private renderer: Renderer2,
        @Optional() @Inject(KBQ_FILE_UPLOAD_CONFIGURATION) public readonly configuration: KbqInputFileLabel,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) private localeService?: KbqLocaleService
    ) {
        this.localeService?.changes
            .subscribe(this.updateLocaleParams);

        if (!localeService) {
            this.initDefaultParams();
        }
    }

    onFileSelectedViaClick({ target }: Event): void {
        if (this.disabled) { return; }

        const files: FileList | null = (target as HTMLInputElement).files;
        if (files?.length) {
            this.file = this.mapToFileItem(files[0]);
            this.fileQueueChange.emit(this.file);
        }
        /* even if the user selects the same file,
         the onchange event will be triggered every time user clicks on the control.*/
        this.renderer.setProperty(this.input.nativeElement, 'value', null);
    }

    deleteItem(event?: MouseEvent): void {
        if (this.disabled) { return; }

        event?.stopPropagation();
        this.file = null;
        this.fileQueueChange.emit(this.file);
        this.errors = [];
    }

    onFileDropped(files: FileList | KbqFile[]): void {
        if (this.disabled) { return; }

        if (isCorrectExtension(files[0], this.accept)) {
            this.file = this.mapToFileItem(files[0]);
            this.fileQueueChange.emit(this.file);
        }
    }

    private updateLocaleParams = () => {
        this.config = this.configuration || this.localeService?.getParams('fileUpload').multiple;

        this.getCaptionText();

        this.cdr.markForCheck();
    }

    private mapToFileItem(file: File): KbqFileItem {
        return {
            file,
            hasError: this.validateFile(file),
            progress: new BehaviorSubject<number>(0),
            loading: new BehaviorSubject<boolean>(false)
        };
    }

    private validateFile(file: File): boolean | undefined {
        if (!this.customValidation?.length) { return; }

        this.errors = this.customValidation
            .reduce(
                (errors: (string | null)[], validatorFn: KbqFileValidatorFn) => {
                    errors.push(validatorFn(file));

                    return errors;
                },
                []
            )
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

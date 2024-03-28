import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Output,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { CanDisable } from '@koobiq/components/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import {
    KBQ_FILE_UPLOAD_CONFIGURATION, KbqFile,
    KbqFileItem,
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


export const KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION: KbqInputFileMultipleLabel = {
    captionText: 'Перетащите сюда или',
    captionTextWhenSelected: 'Перетащите еще или',
    captionTextForCompactSize: 'Перетащите файлы или',
    browseLink: 'выберите',
    title: 'Загрузите файлы',
    gridHeaders: {
        file: 'Файл',
        size: 'Размер'
    }
};


@Component({
    selector: 'kbq-multiple-file-upload',
    templateUrl: './multiple-file-upload.component.html',
    styleUrls: ['./file-upload.scss', './multiple-file-upload.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-multiple-file-upload'
    }
})
export class KbqMultipleFileUploadComponent implements AfterViewInit, OnDestroy, KbqInputFile, CanDisable {
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

    private focusMonitorSubscription = Subscription.EMPTY;

    get acceptedFiles(): string {
        return this.accept && this.accept.length > 0 ? this.accept.map((ext: string) => `.${ext}`).join(',') : '*/*';
    }

    get hasErrors(): boolean {
        return this.errors && !!this.errors.length;
    }

    constructor(
        private focusMonitor: FocusMonitor,
        private cdr: ChangeDetectorRef,
        private renderer: Renderer2,
        @Optional() @Inject(KBQ_FILE_UPLOAD_CONFIGURATION) public config: KbqInputFileMultipleLabel
    ) {
        this.config = config || KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION;
        this.columnDefs = [
            { header: this.config.gridHeaders.file, cssClass: 'file' },
            { header: this.config.gridHeaders.size, cssClass: 'size' },
            { header: '', cssClass: 'action' }
        ];
    }

    ngAfterViewInit(): void {
        this.focusMonitorSubscription = this.focusMonitor.monitor(this.input)
            .subscribe((origin) => this.onFocus(origin === 'keyboard'));
    }

    ngOnDestroy(): void {
        this.focusMonitorSubscription.unsubscribe();
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

    onFocus(focusState: boolean) {
        if (this.disabled) { return; }
        this.hasFocus = focusState;
        this.cdr.markForCheck();
    }

    private mapToFileItem(files: FileList | KbqFile[] | null): KbqFileItem[] {
        if (!files) { return []; }

        return Array.from(files)
            .filter((file) => this.isCorrectExtension(file))
            .map((file: File) => ({
                file,
                hasError: this.validateFile(file),
                loading: new BehaviorSubject<boolean>(false),
                progress: new BehaviorSubject<number>(0)
            }));
    }

    private validateFile(file: File): boolean | undefined {
        if (this.customValidation && this.customValidation.length) {
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
    }

    private isCorrectExtension(file: File): boolean {
        const fileExt: string = file.name.split('.').pop() || '';

        return this.acceptedFiles !== '*/*' && this.acceptedFiles.length > 0 ? this.acceptedFiles.includes(fileExt) : true;
    }
}

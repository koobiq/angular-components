import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Output,
    Renderer2,
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


let nextSingleFileUploadUniqueId = 0;

export const KBQ_SINGLE_FILE_UPLOAD_DEFAULT_CONFIGURATION: KbqInputFileLabel = {
    captionText: 'Перетащите файл или',
    browseLink: 'выберите'
};

@Component({
    selector: 'kbq-single-file-upload',
    templateUrl: './single-file-upload.component.html',
    styleUrls: ['./file-upload.scss', './single-file-upload.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-single-file-upload'
    }
})
export class KbqSingleFileUploadComponent implements AfterViewInit, OnDestroy, KbqInputFile, CanDisable {
    @Input() accept: string[];
    @Input() disabled: boolean = false;
    @Input() errors: string[] = [];
    @Input() files: KbqFileItem[] = [];
    @Input() inputId: string = `kbq-single-file-upload-${nextSingleFileUploadUniqueId++}`;
    @Input() customValidation?: KbqFileValidatorFn[];
    @Output() fileQueueChanged: EventEmitter<KbqFileItem | null> = new EventEmitter<KbqFileItem | null>();

    @ViewChild('input') input: ElementRef<HTMLInputElement>;

    hasFocus = false;

    private focusMonitorSubscription = Subscription.EMPTY;

    get acceptedFiles(): string {
        return this.accept && this.accept.length > 0 ? this.accept.map((ext: string) => `.${ext}`).join(',') : '*/*';
    }

    constructor(
        private focusMonitor: FocusMonitor,
        private cdr: ChangeDetectorRef,
        private renderer: Renderer2,
        @Optional() @Inject(KBQ_FILE_UPLOAD_CONFIGURATION) public config: KbqInputFileLabel
    ) {
        this.config = config || KBQ_SINGLE_FILE_UPLOAD_DEFAULT_CONFIGURATION;
    }

    ngAfterViewInit(): void {
        this.focusMonitorSubscription = this.focusMonitor.monitor(this.input)
            .subscribe((origin) => this.onFocus(origin === 'keyboard'));
    }

    ngOnDestroy(): void {
        this.focusMonitorSubscription.unsubscribe();
    }

    onFileSelectedViaClick({ target }: Event): void {
        if (this.disabled) { return; }

        const files: FileList | null = (target as HTMLInputElement).files;
        if (files?.length) {
            this.files = [this.mapToFileItem(files[0])];
            this.fileQueueChanged.emit(this.files[0]);
        }
        /* even if the user selects the same file,
         the onchange event will be triggered every time user clicks on the control.*/
        this.renderer.setProperty(this.input.nativeElement, 'value', null);
    }

    deleteItem(event?: MouseEvent): void {
        if (this.disabled) { return; }

        event?.stopPropagation();
        this.files = [];
        this.errors = [];
        this.fileQueueChanged.emit(null);
    }

    onFileDropped(files: FileList | KbqFile[]): void {
        if (this.disabled) { return; }

        if (this.isCorrectExtension(files[0])) {
            this.files = Array.from(files)
                .map((file) => this.mapToFileItem(file));
            this.fileQueueChanged.emit(this.files[0]);
        }
    }

    onFocus(focusState: boolean) {
        if (this.disabled) { return; }
        this.hasFocus = focusState;
        this.cdr.markForCheck();
    }

    private mapToFileItem(file: File): KbqFileItem {
        this.validateFile(file);

        return {
            file,
            progress: new BehaviorSubject<number>(0),
            loading: new BehaviorSubject<boolean>(false)
        };
    }

    private validateFile(file: File): void {
        if (this.customValidation && this.customValidation.length) {
            this.errors = this.customValidation.reduce(
                (errors: (string | null)[], validatorFn: KbqFileValidatorFn) => {
                    errors.push(validatorFn(file));

                    return errors;
                },
                []).filter(Boolean) as string[];
        }
    }

    private isCorrectExtension(file: File): boolean {
        const fileExt: string = file.name.split('.').pop() || '';

        return this.acceptedFiles !== '*/*' && this.acceptedFiles.length > 0 ? this.acceptedFiles.includes(fileExt) : true;
    }
}

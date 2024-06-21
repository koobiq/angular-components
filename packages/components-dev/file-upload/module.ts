/* tslint:disable:no-console no-reserved-keywords */
import { NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Directive,
    EventEmitter,
    Inject,
    Input,
    NgModule,
    Output,
    ViewEncapsulation
} from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrors
} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_LOCALE_SERVICE, KbqDataSizePipe, KbqLocaleService, KbqLocaleServiceModule } from '@koobiq/components/core';
import {
    KBQ_FILE_UPLOAD_CONFIGURATION,
    KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION,
    KbqFileItem,
    KbqFileUploadModule,
    KbqFileValidatorFn
} from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqRadioChange, KbqRadioModule } from '@koobiq/components/radio';
import { interval, takeWhile, timer } from 'rxjs';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';


const maxFileExceeded = (file: File): string | null => {
    const kilo = 1024;
    const mega = kilo * kilo;
    const maxMbytes = 5;
    const maxSize = maxMbytes * mega;

    return maxSize !== undefined && (file?.size ?? 0) > maxSize
        ? `Размер файла превышает максимально допустимый (${maxSize / mega} МБ)`
        : null;
};

const maxFileExceededFn = (control: AbstractControl): ValidationErrors | null => {
    const kilo = 1024;
    const mega = kilo * kilo;
    const maxMbytes = 5;
    const maxSize = maxMbytes * mega;

    return maxSize !== undefined && ((control.value as KbqFileItem)?.file?.size ?? 0) > maxSize
        ? { maxFileExceeded: `Размер файла превышает максимально допустимый (${ maxSize / mega } МБ)` }
        : null;
};

const maxFileExceededMultipleFn = (control: AbstractControl): ValidationErrors | null => {
    const kilo = 1024;
    const mega = kilo * kilo;
    const maxMbytes = 5;
    const maxSize = maxMbytes * mega;

    const value: KbqFileItem[] = control.value;

    const errors = value.reduce<ValidationErrors>((res, current) => {
        // validation check & hasError set to represent error state
        if (maxSize !== undefined && (current?.file?.size ?? 0) > maxSize) {
            current.hasError = true;
            res[current.file.name] = `${current.file.name} — Размер файла превышает максимально допустимый (${ maxSize / mega } МБ)`;
        }
        return res;
    }, {})

    return maxSize !== undefined && !!Object.values(errors).length
        ? errors
        : null;
};

@Component({
    selector: 'file-upload-compact',
    template: `
        <kbq-multiple-file-upload
            size="compact"
            [disabled]="disabled"
            [inputId]="'test-compact'"
            [errors]="errorMessagesForMultiple"
            [files]="files"
            (fileQueueChanged)="addedFiles($event)">

            <ng-template #kbqFileIcon>
                <i kbq-icon="mc-file-empty_16"></i>
            </ng-template>
            <span hint>test</span>
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
    ]
})
export class MultipleFileUploadCompactComponent {
    @Input() disabled: boolean;
    @Input() errorMessagesForMultiple: string[] = [];
    @Input() files: KbqFileItem[] = [];
    @Output() addedFile: EventEmitter<any> = new EventEmitter<any>();

    addedFiles(event: KbqFileItem[]) {
        this.addedFile.emit(event);
    }
}


@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoComponent {
    disabled = false;
    validation: KbqFileValidatorFn[] = [maxFileExceeded];

    file: KbqFileItem | null;
    files: KbqFileItem[] = [];
    errorMessagesForSingle: string[] = [];
    errorMessagesForMultiple: string[] = [];
    accept = ['.pdf', '.png'];

    control = new FormControl<KbqFileItem | null>(null, maxFileExceededFn);

    form = new FormGroup({
        'file-upload': new FormControl<KbqFileItem | null>(null, maxFileExceededFn)
    }, { updateOn: 'submit'});

    formMultiple = new FormGroup({
        'file-upload': new FormControl<FileList | KbqFileItem[]>([], maxFileExceededMultipleFn)
    }, { updateOn: 'submit'});

    secondControl = new FormControl<File | KbqFileItem | null>(null);
    multipleFileUploadControl = new FormControl<FileList | KbqFileItem[]>([], maxFileExceededMultipleFn);

    languageList = [
        { id: 'ru-RU' },
        { id: 'en-US' },
        { id: 'pt-BR' },
        { id: 'es-LA' },
        { id: 'zh-CN' },
        { id: 'fa-IR' }
    ];
    selectedLanguage: any = this.languageList[0];

    constructor(
        private cdr: ChangeDetectorRef,
        @Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService
    ) {
        this.control.valueChanges.subscribe((value: KbqFileItem | null) => {
            // can be used mapped file item
            // this.secondControl.setValue(value);
            // or even JS file object
            this.secondControl.setValue(value?.file || null);
        });
    }

    setFormat($event: KbqRadioChange): void {
        this.selectedLanguage = this.languageList.find(({ id }) => id === $event.value.id);

        this.localeService.setLocale($event.value.id);
    }

    addFile(file: KbqFileItem | null) {
        this.file = file;
    }

    addFileMultiple(files: KbqFileItem[]) {
        this.files = files;
        // this.checkValidation();
    }

    checkValidation() {
        this.errorMessagesForSingle = [];
        this.errorMessagesForMultiple = [];
        if (this.file) {
            this.errorMessagesForSingle = this.validation.map((fn) => fn(this.file!.file) || '')
                .filter(Boolean);
        }

        this.files = this.files.map((file) => {
            const errorsPerFile: string[] = this.validation.map((fn) => fn(file!.file) || '')
                .filter(Boolean);

            this.errorMessagesForMultiple = [
                ...this.errorMessagesForMultiple,
                ...errorsPerFile
            ].filter(Boolean);

            return {
                ...file,
                hasError: errorsPerFile.length > 0
            };
        });

        this.cdr.markForCheck();
    }

    onSubmit() {
        console.log(this.form.get('first')?.errors?.maxFileExceeded);
    }

    toggleDisabled() {
        this.disabled = !this.disabled;
        [this.control, this.secondControl, this.form, this.formMultiple, this.multipleFileUploadControl]
            .forEach((control) => control.enabled ? control.disable() : control.enable())
    }

    startLoading(): void {
        const maxPercent = 100;
        const loadingOffset  = 100;

        this.file?.loading?.next(true);

        interval(loadingOffset)
            .pipe(takeWhile((value) => value <= maxPercent))
            .subscribe((value) => this.file?.progress?.next(value));

        this.files.forEach((file, index) => {
            file.loading?.next(true);

            timer(loadingOffset * (index), loadingOffset * index)
                .pipe(takeWhile((value) => value <= maxPercent))
                .subscribe((value) => file.progress?.next(value));
        });
    }

    startIndeterminateLoading() {
        this.files.forEach((file) => timer(300)
            .subscribe(() => file.loading?.next(true))
        );

        timer(5000).subscribe(() => this.files
            .forEach((file) => file.loading?.next(false))
        );
    }
}


@Directive({
    selector: '[custom-text]',
    providers: [{
        provide: KBQ_FILE_UPLOAD_CONFIGURATION, useValue: {
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
    }]
})
export class CustomTextDirective {}


@NgModule({
    declarations: [
        DemoComponent,
        CustomTextDirective,
        MultipleFileUploadCompactComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        KbqLocaleServiceModule,
        KbqFileUploadModule,
        KbqButtonModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconModule,
        NgIf,
        KbqCheckboxModule,
        KbqRadioModule,
        KbqDataSizePipe
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}

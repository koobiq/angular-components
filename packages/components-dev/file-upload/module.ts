/* tslint:disable:no-console no-reserved-keywords */
import { NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Directive,
    EventEmitter,
    Input,
    NgModule,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLocaleServiceModule } from '@koobiq/components/core';
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
import { interval, takeWhile, timer } from 'rxjs';


const maxFileExceeded = (file: File): string | null => {
    const kilo = 1024;
    const mega = kilo * kilo;
    const maxMbytes = 5;
    const maxSize = maxMbytes * mega;

    return maxSize !== undefined && (file?.size ?? 0) > maxSize
        ? `Размер файла превышает максимально допустимый (${maxSize / mega} МБ)`
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
            <span hint>Ctest</span>
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

    constructor(private cdr: ChangeDetectorRef) {}

    addFile(file: KbqFileItem | null) {
        this.file = file;

        if (file) {
            this.errorMessagesForSingle = [maxFileExceeded(file.file) || ''].filter(Boolean);
        }
    }

    addFileMultiple(files: KbqFileItem[]) {
        this.files = files;
        // this.checkValidation();
    }

    checkValidation() {
        this.errorMessagesForMultiple = [];

        this.files = this.files.map((file) => {
            const errorsPerFile: string[] = [maxFileExceeded(file.file) || ''].filter(Boolean);

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
        KbqLocaleServiceModule,
        KbqFileUploadModule,
        KbqButtonModule,
        FormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconModule,
        NgIf
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}

import { ChangeDetectionStrategy, Component, Injectable } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroupDirective,
    NgForm,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { ErrorStateMatcher, kbqErrorStateMatcherProvider } from '@koobiq/components/core';
import { KbqFileItem, KbqMultipleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';

@Injectable()
export class CustomErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null, _form: FormGroupDirective | NgForm | null): boolean {
        return !!control?.invalid;
    }
}

/**
 * @title File-upload multiple error
 */
@Component({
    selector: 'file-upload-multiple-error-example',
    imports: [
        ReactiveFormsModule,
        KbqIconModule,
        KbqMultipleFileUploadComponent
    ],
    template: `
        <kbq-multiple-file-upload inputId="file-upload-multiple-error-overview" [formControl]="fileUpload">
            <ng-template #kbqFileIcon let-file>
                @if (!file.hasError) {
                    <i kbq-icon="kbq-file-text-o_16"></i>
                }
                @if (file.hasError) {
                    <i kbq-icon="kbq-triangle-exclamation_16"></i>
                }
            </ng-template>
        </kbq-multiple-file-upload>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        kbqErrorStateMatcherProvider(CustomErrorStateMatcher)
    ]
})
export class FileUploadMultipleErrorExample {
    protected readonly fileUpload = new FormControl<KbqFileItem | null>(null, Validators.required);
}

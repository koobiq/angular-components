import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { ShowOnFormSubmitErrorStateMatcher } from '@koobiq/components/core';
import { KbqFileItem, KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title File upload multiple required reactive validation example
 */
@Component({
    standalone: true,
    selector: 'file-upload-multiple-required-reactive-validation-example',
    template: `
        <form [formGroup]="formMultiple" (ngSubmit)="onSubmit()">
            <kbq-file-upload
                #kbqFileUpload
                class="layout-margin-bottom-s"
                formControlName="fileUpload"
                multiple
                [errorStateMatcher]="customErrorStateMatcher"
                [progressMode]="'indeterminate'"
            >
                <ng-template #kbqFileIcon>
                    <i kbq-icon="kbq-file-o_16"></i>
                </ng-template>
                @if (kbqFileUpload.invalid && formMultiple.controls.fileUpload.hasError('required')) {
                    <kbq-hint color="error">File required</kbq-hint>
                }
            </kbq-file-upload>
            <button class="layout-margin-top-m" kbq-button type="submit">Submit</button>
        </form>
    `,
    imports: [
        ReactiveFormsModule,
        KbqFileUploadModule,
        KbqFormFieldModule,
        KbqButtonModule,
        KbqIconModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadMultipleRequiredReactiveValidationExample {
    protected readonly customErrorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();

    protected readonly formMultiple = new FormGroup({
        fileUpload: new FormControl<FileList | KbqFileItem[]>([], Validators.required)
    });

    onSubmit() {
        console.log('perform action on submit');
    }
}

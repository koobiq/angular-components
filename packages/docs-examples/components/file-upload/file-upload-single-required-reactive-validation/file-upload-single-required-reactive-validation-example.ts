import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { ShowOnFormSubmitErrorStateMatcher } from '@koobiq/components/core';
import { KbqFileItem, KbqSingleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title File upload single required reactive validation example
 */
@Component({
    selector: 'file-upload-single-required-reactive-validation-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqButtonModule,
        KbqIconModule,
        KbqSingleFileUploadComponent
    ],
    template: `
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <kbq-file-upload
                #kbqFileUpload
                class="layout-margin-bottom-s"
                formControlName="fileUpload"
                [errorStateMatcher]="customErrorStateMatcher"
                [progressMode]="'indeterminate'"
            >
                <i kbq-icon="kbq-file-o_16"></i>

                @if (kbqFileUpload.invalid && form.controls.fileUpload.hasError('required')) {
                    <kbq-hint color="error">File required</kbq-hint>
                }
            </kbq-file-upload>
            <button class="layout-margin-top-m" kbq-button type="submit">Submit</button>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadSingleRequiredReactiveValidationExample {
    protected readonly customErrorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();

    protected readonly form = new FormGroup({
        fileUpload: new FormControl<KbqFileItem | null>(null, Validators.required)
    });

    onSubmit() {
        console.log('perform action on submit');
    }
}

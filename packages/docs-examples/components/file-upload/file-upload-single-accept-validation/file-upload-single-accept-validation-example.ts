import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FileValidators, KbqFileTypeSpecifier } from '@koobiq/components/core';
import { KbqSingleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title File upload single accept validation
 */
@Component({
    selector: 'file-upload-single-accept-validation-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqSingleFileUploadComponent
    ],
    template: `
        <form [formGroup]="formGroup">
            <kbq-file-upload class="layout-margin-bottom-s" formControlName="fileControl" [accept]="accept">
                @if (!formGroup.get('fileControl')?.errors) {
                    <i kbq-icon="kbq-file-o_16"></i>
                } @else {
                    <i kbq-icon="kbq-triangle-exclamation_16"></i>
                }

                @if (formGroup.get('fileControl')?.hasError('fileExtensionMismatch')) {
                    <kbq-hint color="error">{{ t().provideValidExtension }}</kbq-hint>
                }

                <kbq-hint>{{ t().fileTxtAllowed }}</kbq-hint>
            </kbq-file-upload>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadSingleAcceptValidationExample extends BaseLocalizedExample<ExampleTranslation> {
    protected accept: KbqFileTypeSpecifier = ['.txt'];

    protected readonly formGroup = new FormGroup({
        fileControl: new FormControl(null, FileValidators.isCorrectExtension(this.accept))
    });

    constructor() {
        super(TRANSLATIONS);
    }
}

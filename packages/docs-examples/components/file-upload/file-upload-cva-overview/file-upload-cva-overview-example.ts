import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqFileItem, KbqFileUploadModule } from '@koobiq/components/file-upload';

/**
 * @title File upload with Control Value Accessor
 */
@Component({
    standalone: true,
    selector: 'file-upload-cva-overview-example',
    template: `
        <div class="kbq-form-horizontal">
            <div class="kbq-form__row layout-margin-bottom-m">
                <label class="kbq-form__label flex-20">Single file-upload with formControl</label>
                <kbq-file-upload
                    class="kbq-form__control flex-80"
                    [formControl]="control"
                >
                    <i kbq-icon="kbq-file-o_16"></i>
                </kbq-file-upload>
            </div>
        </div>
    `,
    imports: [
        KbqFileUploadModule,
        ReactiveFormsModule
    ]
})
export class FileUploadCvaOverviewExample {
    control = new FormControl<KbqFileItem | null>(null);
}

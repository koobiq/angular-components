import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFileItem, KbqFileUploadModule } from '@koobiq/components/file-upload';

/**
 * @title File upload with Control Value Accessor
 */
@Component({
    standalone: true,
    selector: 'file-upload-cva-overview-example',
    template: `
        <kbq-checkbox
            class="layout-margin-bottom-s"
            [checked]="control.disabled"
            (change)="control.disabled ? control.enable() : control.disable()"
        >
            disable first control
        </kbq-checkbox>

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
            <div class="kbq-form__row layout-margin-bottom-m">
                <label class="kbq-form__label flex-20">control that depends on first control value</label>
                <kbq-file-upload
                    class="kbq-form__control flex-80"
                    [formControl]="secondControl"
                >
                    <i kbq-icon="kbq-file-o_16"></i>
                </kbq-file-upload>
            </div>
        </div>
    `,
    imports: [
        KbqCheckboxModule,
        KbqFileUploadModule,
        ReactiveFormsModule
    ]
})
export class FileUploadCvaOverviewExample {
    control = new FormControl<KbqFileItem | null>(null);
    secondControl = new FormControl<File | KbqFileItem | null>(null);

    constructor() {
        this.control.valueChanges.subscribe((value: KbqFileItem | null) => {
            // can be used mapped file item
            // this.secondControl.setValue(value);

            // or even JS file object
            this.secondControl.setValue(value?.file || null);
        });
    }
}

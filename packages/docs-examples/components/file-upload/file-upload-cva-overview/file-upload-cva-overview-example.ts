import { Component } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { KbqFileItem } from '@koobiq/components/file-upload';

const maxFileExceededFn = (control: AbstractControl): ValidationErrors | null => {
    const kilo = 1024;
    const mega = kilo * kilo;
    const maxMbytes = 5;
    const maxSize = maxMbytes * mega;

    return maxSize !== undefined && ((control.value as KbqFileItem)?.file?.size ?? 0) > maxSize
        ? { maxFileExceeded: `Размер файла превышает максимально допустимый (${maxSize / mega} МБ)` }
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
            res[current.file.name] =
                `${current.file.name} — Размер файла превышает максимально допустимый (${maxSize / mega} МБ)`;
        }
        return res;
    }, {});

    return maxSize !== undefined && !!Object.values(errors).length ? errors : null;
};

/**
 * @title File upload with Control Value Accessor
 */
@Component({
    selector: 'file-upload-cva-overview-example',
    templateUrl: 'file-upload-cva-overview-example.html',
    styleUrls: ['file-upload-cva-overview-example.css']
})
export class FileUploadCvaOverviewExample {
    control = new FormControl<KbqFileItem | null>(null, maxFileExceededFn);
    secondControl = new FormControl<File | KbqFileItem | null>(null);
    multipleFileUploadControl = new FormControl<FileList | KbqFileItem[]>([], maxFileExceededMultipleFn);

    constructor() {
        this.control.valueChanges.subscribe((value: KbqFileItem | null) => {
            // can be used mapped file item
            // this.secondControl.setValue(value);

            // or even JS file object
            this.secondControl.setValue(value?.file || null);
        });
    }
}

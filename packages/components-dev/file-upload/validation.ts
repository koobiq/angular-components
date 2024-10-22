import { AbstractControl, ValidationErrors } from '@angular/forms';
import { maxFileSize as maxFileSizeValidation } from '@koobiq/components/core';
import { KbqFileItem } from '@koobiq/components/file-upload';

export const maxFileExceededFiveMbs = maxFileSizeValidation(
    5 * 2 ** 20,
    'Размер файла превышает максимально допустимый (5 МБ)'
);

export const maxFileSize = (control: AbstractControl): ValidationErrors | null => {
    const kilo = 1024;
    const mega = kilo * kilo;
    const maxMbytes = 5;
    const maxSize = maxMbytes * mega;

    const value: KbqFileItem[] = control.value;
    let result: string | true | null = null;

    if (!value.length) return null;

    for (const fileItem of value) {
        if ((fileItem.file?.size ?? 0) > maxSize) {
            fileItem.hasError = true;
            result = true;
        }
    }
    return { maxFileSize: result };
};

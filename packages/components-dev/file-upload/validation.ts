import { AbstractControl, ValidationErrors } from '@angular/forms';
import { KbqFileItem } from '@koobiq/components/file-upload';

export const maxFileExceeded = (file: File): string | null => {
    const kilo = 1024;
    const mega = kilo * kilo;
    const maxMbytes = 5;
    const maxSize = maxMbytes * mega;

    return maxSize !== undefined && (file?.size ?? 0) > maxSize
        ? `Размер файла превышает максимально допустимый (${maxSize / mega} МБ)`
        : null;
};

export const maxFileExceededFn = (control: AbstractControl): ValidationErrors | null => {
    const kilo = 1024;
    const mega = kilo * kilo;
    const maxMbytes = 5;
    const maxSize = maxMbytes * mega;

    return ((control.value as KbqFileItem)?.file?.size ?? 0) > maxSize ? { maxFileSize: true } : null;
};

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

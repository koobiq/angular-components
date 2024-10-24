import { AbstractControl, ValidationErrors } from '@angular/forms';
import { KbqFileItem } from '@koobiq/components/file-upload';

const MAX_FILE_SIZE = 5 * 2 ** 20;

export const maxFileExceededFiveMbs = (file: File) => {
    if (!file) return null;
    if (file.size > MAX_FILE_SIZE) {
        return 'Размер файла превышает максимально допустимый (5 МБ)';
    }

    return null;
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

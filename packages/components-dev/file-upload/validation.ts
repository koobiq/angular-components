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

// export const maxFileExceededMultipleFn = (control: AbstractControl): ValidationErrors | null => {
//     const kilo = 1024;
//     const mega = kilo * kilo;
//     const maxMbytes = 5;
//     const maxSize = maxMbytes * mega;
//
//     const value: KbqFileItem[] = control.value;
//
//     const errors = value.reduce<ValidationErrors>((res, current) => {
//         // validation check & hasError set to represent error state
//         if ((current?.file?.size ?? 0) > maxSize) {
//             current.hasError = true;
//             res[current.file.name] =
//                 `${current.file.name} — Размер файла превышает максимально допустимый (${maxSize / mega} МБ)`;
//         }
//         return res;
//     }, {});
//
//     return Object.values(errors).length ? errors : null;
// };

export const maxFileSize = (control: AbstractControl): ValidationErrors | null => {
    const kilo = 1024;
    const mega = kilo * kilo;
    const maxMbytes = 5;
    const maxSize = maxMbytes * mega;

    const value: KbqFileItem[] = control.value;
    let result: string | true | null = null;

    for (const fileItem of value) {
        if ((fileItem.file?.size ?? 0) > maxSize) {
            fileItem.hasError = true;
            result = true;
        }
    }
    return { maxFileSize: result };
};

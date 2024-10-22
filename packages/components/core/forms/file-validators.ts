import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export type KbqFileValidatorFn = (file: File | null) => string | null;

/**
 * Creates a validator function that checks if a file's size exceeds a maximum allowed size.
 *
 *
 * @returns {function(File | null): string | null} - A validator function that takes a file (or null) and returns an error message (if applicable) or null.
 */
export const maxFileSize =
    (maxFileSize: number, errorMessage: string): KbqFileValidatorFn =>
    (file: File | null): string | null => {
        if (!file) return null;
        if (file.size > maxFileSize) {
            return errorMessage;
        }

        return null;
    };

/** Provides a set of validators for file-related form controls. */
export class FileValidators {
    /**
     * Validator that checks if the file size is less than or equal to the provided `maxSize`.
     *
     * @param maxSize - The maximum allowed file size in bytes.
     *
     * @returns A ValidatorFn function that checks the file size.
     *
     * ## Usage:
     *
     *      * const control = new FormControl(null, [FileValidators.maxFileSize(1024 * 1024)]); // 1MB
     *      * control.setValue(new File(['content'], 'test.txt', { type: 'text/plain' }));
     *      * console.log(control.errors); // null (if the file size is less than or equal to 1MB)
     *      * control.setValue(new File(['content'], 'test.txt', { type: 'text/plain', size: 1024 × 1024 × 2 })); // 2MB
     *      * console.log(control.errors); // {maxFileSize: true}
     */
    static maxFileSize(maxSize: number): ValidatorFn {
        return ({ value }: AbstractControl): ValidationErrors | null => {
            if (!value) return null;

            const size = value instanceof File ? value.size : value.file.size;

            if (size > maxSize) {
                return { maxFileSize: true };
            }

            return null;
        };
    }
}

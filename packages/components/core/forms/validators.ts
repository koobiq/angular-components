import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Provides a set of validators for password form controls. */
export class PasswordValidators {
    /**
     * Validator that requires the control's value length to be at least `min` characters.
     *
     * `min` - number of characters.
     *
     * ## Usage:
     *
     * ```typescript
     * const control = new FormControl('password', PasswordValidators.minLength(10));
     * console.log(control.errors); // {minLength: {min: 10, actual: 8}}
     * ```
     */
    static minLength(min: number): ValidatorFn {
        return ({ value }: AbstractControl): ValidationErrors | null => {
            if (typeof value !== 'string') {
                return null;
            }

            return value.length >= min ? null : { minLength: { min, actual: value.length } };
        };
    }

    /**
     * Validator that requires the control's value length to be at most `max` characters.
     *
     * `max` - number of characters.
     *
     * ## Usage:
     * ```typescript
     * const control = new FormControl('password', PasswordValidators.maxLength(6));
     * console.log(control.errors); // {maxLength: {max: 6, actual: 8}}
     * ```
     */
    static maxLength(max: number): ValidatorFn {
        return ({ value }: AbstractControl): ValidationErrors | null => {
            if (typeof value !== 'string') {
                return null;
            }

            return value.length <= max ? null : { maxLength: { max, actual: value.length } };
        };
    }

    /**
     * Validator that requires the control's value to be at least `min` uppercase characters.
     *
     * `min` - number of uppercase characters.
     *
     * ### Usage:
     *
     * ```typescript
     * const control = new FormControl('Password', PasswordValidators.minUppercase(2));
     * console.log(control.errors); // {minUppercase: {min: 2, actual: 1}}
     * ```
     */
    static minUppercase(min: number): ValidatorFn {
        return ({ value }: AbstractControl): ValidationErrors | null => {
            if (typeof value !== 'string') {
                return null;
            }

            const matches = (value.match(/[A-Z]/g) || []).length;

            return matches >= min ? null : { minUppercase: { min, actual: matches } };
        };
    }

    /**
     * Validator that requires the control's value to be at least `min` lowercase characters.
     *
     * `min` - number of lowercase characters.
     *
     * ### Usage:
     *
     * ```typescript
     * const control = new FormControl('PASSWORD', PasswordValidators.minLowercase());
     * console.log(control.errors); // {minLowercase: {min: 1, actual: 0}}
     * ```
     */
    static minLowercase(min: number): ValidatorFn {
        return ({ value }: AbstractControl): ValidationErrors | null => {
            if (typeof value !== 'string') {
                return null;
            }

            const matches = (value.match(/[a-z]/g) || []).length;

            return matches >= min ? null : { minLowercase: { min, actual: matches } };
        };
    }

    /**
     * Validator that requires the control's value to be at least `min` number characters.
     *
     * `min` - number of number characters.
     *
     * ### Usage:
     *
     * ```typescript
     * const control = new FormControl('passw0rd', PasswordValidators.minNumber(2));
     * console.log(control.errors); // {minNumber: {min: 2, actual: 1}}
     * ```
     */
    static minNumber(min: number): ValidatorFn {
        return ({ value }: AbstractControl): ValidationErrors | null => {
            if (typeof value !== 'string') {
                return null;
            }

            const matches = (value.match(/[\d]/g) || []).length;

            return matches >= min ? null : { minNumber: { min, actual: matches } };
        };
    }

    /**
     * Validator that requires the control's value to be at least `min` special characters.
     *
     * `min` - number of special characters.
     *
     * ### Special characters:
     * ```js
     * ['!','@','#','$','%','^','&','*']
     * ```
     *
     * ### Usage:
     *
     * ```typescript
     * const control = new FormControl('pa$sword', PasswordValidators.minSpecial(2));
     * console.log(control.errors); // {minSpecial: {min: 2, actual: 1}}
     * ```
     */
    static minSpecial(min: number): ValidatorFn {
        return ({ value }: AbstractControl): ValidationErrors | null => {
            if (typeof value !== 'string') {
                return null;
            }

            const matches = (value.match(/[!@#$%^&*]/g) || []).length;

            return matches >= min ? null : { minSpecial: { min, actual: matches } };
        };
    }
}

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
     * ```typescript
     * const control = new FormControl(null, [FileValidators.maxFileSize(1024 * 1024)]); // 1MB
     * control.setValue(FILE_LESS_OR_EQUAL_THAN_1MB);
     * console.log(control.errors); // null
     * control.setValue(FILE_MORE_THAN_1MB);
     * console.log(control.errors); // {maxFileSize: { max: 1048576, actual: FILE_MORE_THAN_1MB.size }}
     * ```
     */
    static maxFileSize(maxSize: number): ValidatorFn {
        return ({ value }: AbstractControl): ValidationErrors | null => {
            if (!value) return null;

            const size = value instanceof File ? value.size : value.file.size;

            if (size > maxSize) {
                return { maxFileSize: { max: maxSize, actual: size } };
            }

            return null;
        };
    }

    /**
     * Validator that checks whether file's name or MIME type
     * matches one of the accepted extensions or MIME types.
     *
     * @param accept - Array of allowed file extensions or MIME types.
     * @returns ValidatorFn that returns validation error if file type is not accepted, or null otherwise.
     */
    static isCorrectExtension(accept: (`.${string}` | `${string}/${string}`)[]): ValidatorFn {
        return (control: AbstractControl<{ file: File } | null>): ValidationErrors | null => {
            if (!accept?.length || !control.value) return null;
            const { name, type } = control.value.file;

            const isValid = accept.some((acceptedExtensionOrMimeType) => {
                const typeAsRegExp = new RegExp(`${acceptedExtensionOrMimeType}$`);

                return typeAsRegExp.test(name) || typeAsRegExp.test(type);
            });

            return isValid ? null : { fileExtensionMismatch: { expected: accept, actual: name } };
        };
    }
}

/**
 * Type helper describing accepted file types, referring to:
 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file#unique_file_type_specifiers
 */
export type KbqFileTypeSpecifier = Parameters<typeof FileValidators.isCorrectExtension>[0];

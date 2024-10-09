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

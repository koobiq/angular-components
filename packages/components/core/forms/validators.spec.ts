import { FormControl } from '@angular/forms';
import { FileValidators, maxFileSize } from '@koobiq/components/core';
import { KbqFileItem } from '@koobiq/components/file-upload';
import { PasswordValidators } from './validators';

describe('Validators', () => {
    describe(PasswordValidators.name, () => {
        describe(PasswordValidators.minLength.name, () => {
            it('should return null if the value.length is greater than or equal to min', () => {
                const control = new FormControl('password', PasswordValidators.minLength(8));
                expect(control.errors).toBeNull();
            });

            it('should return an error if the value length is less than min', () => {
                const control = new FormControl('password', PasswordValidators.minLength(10));
                expect(control.errors).toEqual({ [PasswordValidators.minLength.name]: { min: 10, actual: 8 } });
            });
        });

        describe(PasswordValidators.maxLength.name, () => {
            it('should return null if the value length is less than or equal to max', () => {
                const control = new FormControl('password', PasswordValidators.maxLength(8));
                expect(control.errors).toBeNull();
            });

            it('should return an error if the value length is greater than max', () => {
                const control = new FormControl('password', PasswordValidators.maxLength(4));
                expect(control.errors).toEqual({ [PasswordValidators.maxLength.name]: { max: 4, actual: 8 } });
            });
        });

        describe(PasswordValidators.minUppercase.name, () => {
            it('should return null if the value contains at least min uppercase characters', () => {
                const control = new FormControl('PassWord', PasswordValidators.minUppercase(2));
                expect(control.errors).toBeNull();
            });

            it('should return an error if the value contains fewer than min uppercase characters', () => {
                const control = new FormControl('pasSword', PasswordValidators.minUppercase(2));
                expect(control.errors).toEqual({ [PasswordValidators.minUppercase.name]: { min: 2, actual: 1 } });
            });
        });

        describe(PasswordValidators.minLowercase.name, () => {
            it('should return null if the value contains at least min lowercase characters', () => {
                const control = new FormControl('PAssWORD', PasswordValidators.minLowercase(2));
                expect(control.errors).toBeNull();
            });

            it('should return an error if the value contains fewer than min lowercase characters', () => {
                const control = new FormControl('PASSWORD', PasswordValidators.minLowercase(2));
                expect(control.errors).toEqual({ [PasswordValidators.minLowercase.name]: { min: 2, actual: 0 } });
            });
        });

        describe(PasswordValidators.minNumber.name, () => {
            it('should return null if the value contains at least min number characters', () => {
                const control = new FormControl('passw0rd', PasswordValidators.minNumber(1));
                expect(control.errors).toBeNull();
            });

            it('should return an error if the value contains fewer than min number characters', () => {
                const control = new FormControl('passw0rd', PasswordValidators.minNumber(2));
                expect(control.errors).toEqual({ [PasswordValidators.minNumber.name]: { min: 2, actual: 1 } });
            });
        });

        describe(PasswordValidators.minSpecial.name, () => {
            it('should return null if the value contains at least min special characters', () => {
                const control = new FormControl('pa$$word', PasswordValidators.minSpecial(2));
                expect(control.errors).toBeNull();
            });

            it('should return an error if the value contains fewer than min special characters', () => {
                const control = new FormControl('p@ssword', PasswordValidators.minSpecial(2));
                expect(control.errors).toEqual({
                    [PasswordValidators.minSpecial.name]: { min: 2, actual: 1 }
                });
            });
        });
    });

    describe(FileValidators.name, () => {
        describe(FileValidators.maxFileSize.name, () => {
            const maxFileSize = 1024 * 1024; // 1MB
            it('should return null for a file size less than or equal to maxFileSize', () => {
                const control = new FormControl<File | null>(null, [FileValidators.maxFileSize(maxFileSize)]);
                const file = new File(['content'], 'test.txt', { type: 'text/plain' });
                control.setValue(file);
                expect(control.errors).toBeNull();
            });

            it('should return an error for a file size greater than maxFileSize', () => {
                const max = 10;
                const control = new FormControl<File | null>(null, [FileValidators.maxFileSize(max)]);
                const file = new File(['lorem ipsum'], 'test.txt', { type: 'text/plain' }); // 11 bytes
                control.setValue(file);
                expect(control.errors).toEqual({ maxFileSize: { max, actual: file.size } });
            });

            it('should work with KbqFileItem', () => {
                const control = new FormControl<KbqFileItem | File | null>(null, [
                    FileValidators.maxFileSize(maxFileSize)]);
                const kbqFileItem: KbqFileItem = { file: new File(['content'], 'test.txt', { type: 'text/plain' }) };
                control.setValue(kbqFileItem);
                expect(control.errors).toBeNull();
            });

            it('should return null for an empty value', () => {
                const control = new FormControl(null, [FileValidators.maxFileSize(maxFileSize)]);
                control.setValue(null);
                expect(control.errors).toBeNull();
            });
        });

        describe(`${maxFileSize.name} - standalone function`, () => {
            const errorMessage = 'errorMessage';
            const maxFileSizeInstance = maxFileSize(10, errorMessage);
            it('should return null for an empty value', () => {
                const result = maxFileSizeInstance(null);
                expect(result).toBeNull();
            });

            it('should return null for a file size less than or equal to maxFileSize', () => {
                const result = maxFileSizeInstance(new File(['lorem'], 'test.txt', { type: 'text/plain' }));
                expect(result).toBeNull();
            });

            it('should return an error for a file size greater than maxFileSize', () => {
                const result = maxFileSizeInstance(new File(['lorem ipsum'], 'test.txt', { type: 'text/plain' }));
                expect(result).toEqual(errorMessage);
            });
        });
    });
});
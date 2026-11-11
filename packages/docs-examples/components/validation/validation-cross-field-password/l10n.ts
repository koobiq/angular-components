import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the validation-cross-field-password example. */
export interface ExampleText {
    confirmNewPassword: string;
    currentPassword: string;
    newPassword: string;
    required: string;
    min8: string;
    passwordsDoNotMatch: string;
    passwordMustDiffer: string;
    changePassword: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        confirmNewPassword: 'Подтвердите новый пароль',
        currentPassword: 'Текущий пароль',
        newPassword: 'Новый пароль',
        required: 'Обязательно',
        min8: 'Минимум 8 символов',
        passwordsDoNotMatch: 'Пароли не совпадают',
        passwordMustDiffer: 'Новый пароль должен отличаться от текущего',
        changePassword: 'Сменить пароль'
    },
    default: {
        confirmNewPassword: 'Confirm new password',
        currentPassword: 'Current password',
        newPassword: 'New password',
        required: 'Required',
        min8: 'Minimum 8 characters',
        passwordsDoNotMatch: 'Passwords do not match',
        passwordMustDiffer: 'The new password must differ from the current one',
        changePassword: 'Change password'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

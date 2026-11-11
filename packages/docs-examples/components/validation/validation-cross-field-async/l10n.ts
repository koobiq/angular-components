import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the validation-cross-field-async example. */
export interface ExampleText {
    currentPassword: string;
    newPassword: string;
    passwordTooSimilar: string;
    checkingWithServer: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        currentPassword: 'Текущий пароль',
        newPassword: 'Новый пароль',
        passwordTooSimilar: 'Новый пароль слишком похож на текущий',
        checkingWithServer: 'Проверка на сервере…'
    },
    default: {
        currentPassword: 'Current password',
        newPassword: 'New password',
        passwordTooSimilar: 'The new password is too similar to the current one',
        checkingWithServer: 'Checking with the server…'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the validation-cross-field-async example. */
export interface ExampleTranslation {
    currentPassword: string;
    newPassword: string;
    passwordTooSimilar: string;
    checkingWithServer: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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

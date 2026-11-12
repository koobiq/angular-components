import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the validation-cross-field-password example. */
export interface ExampleTranslation {
    required: string;
    confirmNewPassword: string;
    currentPassword: string;
    newPassword: string;
    min8: string;
    passwordsDoNotMatch: string;
    passwordMustDiffer: string;
    changePassword: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        required: 'Обязательно',
        confirmNewPassword: 'Подтвердите новый пароль',
        currentPassword: 'Текущий пароль',
        newPassword: 'Новый пароль',
        min8: 'Минимум 8 символов',
        passwordsDoNotMatch: 'Пароли не совпадают',
        passwordMustDiffer: 'Новый пароль должен отличаться от текущего',
        changePassword: 'Сменить пароль'
    },
    default: {
        required: 'Required',
        confirmNewPassword: 'Confirm new password',
        currentPassword: 'Current password',
        newPassword: 'New password',
        min8: 'Minimum 8 characters',
        passwordsDoNotMatch: 'Passwords do not match',
        passwordMustDiffer: 'The new password must differ from the current one',
        changePassword: 'Change password'
    }
};

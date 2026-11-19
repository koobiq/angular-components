import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the input-password-overview example. */
export interface ExampleTranslation {
    password: string;
    showPassword: string;
    hidePassword: string;
    minLength: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        password: 'Пароль',
        showPassword: 'Показать пароль',
        hidePassword: 'Скрыть пароль',
        minLength: 'Не меньше 16 символов'
    },
    default: {
        password: 'Password',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        minLength: 'At least 16 characters'
    }
};

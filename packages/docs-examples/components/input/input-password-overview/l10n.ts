import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the input-password-overview example. */
export interface ExampleTranslation {
    showPassword: string;
    hidePassword: string;
    from8to15: string;
    uppercaseLatin: string;
    lowercaseLatin: string;
    latinOnly: string;
    digit: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        showPassword: 'Показать пароль',
        hidePassword: 'Скрыть пароль',
        from8to15: 'От 8 до 15 символов',
        uppercaseLatin: 'Заглавная латинская буква',
        lowercaseLatin: 'Строчная латинская буква',
        latinOnly: 'Только латинские буквы, цифры, пробелы и спецсимволы',
        digit: 'Цифра'
    },
    default: {
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        from8to15: '8 to 15 characters',
        uppercaseLatin: 'An uppercase letter',
        lowercaseLatin: 'A lowercase letter',
        latinOnly: 'Only latin letters, digits, spaces and special characters',
        digit: 'Digit'
    }
};

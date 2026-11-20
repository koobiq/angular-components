import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the input-password-template-driven example. */
export interface ExampleTranslation {
    length: string;
    uppercaseLatin: string;
    lowercaseLatin: string;
    password: string;
    digit: string;
    allowedCharacters: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        length: 'От 8 до 128 символов',
        uppercaseLatin: 'Заглавная латинская буква',
        lowercaseLatin: 'Строчная латинская буква',
        password: 'Пароль',
        digit: 'Цифра',
        allowedCharacters: 'Только латинские буквы, цифры, пробелы и спецсимволы'
    },
    default: {
        length: '8 to 128 characters',
        uppercaseLatin: 'An uppercase letter',
        lowercaseLatin: 'A lowercase letter',
        password: 'Password',
        digit: 'A digit',
        allowedCharacters: 'Only Latin letters, digits, spaces, and special characters'
    }
};

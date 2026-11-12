import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the input-password-template-driven example. */
export interface ExampleText {
    from8to15: string;
    uppercaseLatin: string;
    lowercaseLatin: string;
    password: string;
    digit: string;
    special: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        from8to15: 'От 8 до 15 символов',
        uppercaseLatin: 'Заглавная латинская буква',
        lowercaseLatin: 'Строчная латинская буква',
        password: 'Пароль',
        digit: 'Цифра',
        special: 'Специальный символ'
    },
    default: {
        from8to15: '8 to 15 characters',
        uppercaseLatin: 'An uppercase letter',
        lowercaseLatin: 'A lowercase letter',
        password: 'Password',
        digit: 'A digit',
        special: 'A special character'
    }
};

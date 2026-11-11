import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the input-password-template-driven example. */
export interface ExampleText {
    from8to15: string;
    uppercaseLatin: string;
    lowercaseLatin: string;
    digit: string;
    special: string;
    password: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        from8to15: 'От 8 до 15 символов',
        uppercaseLatin: 'Заглавная латинская буква',
        lowercaseLatin: 'Строчная латинская буква',
        digit: 'Цифра',
        special: 'Специальный символ',
        password: 'Пароль'
    },
    default: {
        from8to15: '8 to 15 characters',
        uppercaseLatin: 'An uppercase letter',
        lowercaseLatin: 'A lowercase letter',
        digit: 'A digit',
        special: 'A special character',
        password: 'Password'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

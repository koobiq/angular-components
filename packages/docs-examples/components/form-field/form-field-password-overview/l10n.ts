import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the form-field-password-overview example. */
export interface ExampleText {
    password: string;
    minLength: string;
    uppercase: string;
    lowercase: string;
    number: string;
    special: string;
    shouldEnterPassword: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        password: 'Пароль',
        minLength: 'Минимальная длина',
        uppercase: 'Заглавные буквы',
        lowercase: 'Строчные буквы',
        number: 'Цифры',
        special: 'Специальные символы',
        shouldEnterPassword: 'Введите пароль'
    },
    default: {
        password: 'Password',
        minLength: 'Min length',
        uppercase: 'Uppercase characters',
        lowercase: 'Lowercase characters',
        number: 'Number characters',
        special: 'Special characters',
        shouldEnterPassword: 'Should enter password'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

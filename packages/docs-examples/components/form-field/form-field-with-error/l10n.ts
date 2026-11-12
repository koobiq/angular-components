import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the form-field-with-error example. */
export interface ExampleText {
    email: string;
    shouldEnterValue: string;
    invalidEmail: string;
    enterEmail: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        email: 'Эл. почта',
        shouldEnterValue: 'Введите значение',
        invalidEmail: 'Некорректная эл. почта',
        enterEmail: 'Введите эл. почту'
    },
    default: {
        email: 'Email',
        shouldEnterValue: 'Should enter a value',
        invalidEmail: 'Invalid email',
        enterEmail: 'Enter email'
    }
};

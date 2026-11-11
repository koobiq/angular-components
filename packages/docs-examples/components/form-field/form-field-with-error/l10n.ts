import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the form-field-with-error example. */
export interface ExampleText {
    email: string;
    shouldEnterValue: string;
    invalidEmail: string;
    enterEmail: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

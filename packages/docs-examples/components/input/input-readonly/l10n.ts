import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the input-readonly example. */
export interface ExampleText {
    placeholder: string;
    showPassword: string;
    hidePassword: string;
    password: string;
    readonly: string;
    text: string;
    number: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        showPassword: 'Показать пароль',
        hidePassword: 'Скрыть пароль',
        password: 'Пароль',
        readonly: 'Только для чтения',
        text: 'Текст',
        number: 'Число'
    },
    default: {
        placeholder: 'Placeholder',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        password: 'Password',
        readonly: 'Readonly',
        text: 'Text',
        number: 'Number'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

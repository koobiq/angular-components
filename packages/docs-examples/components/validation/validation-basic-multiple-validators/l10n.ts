import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the validation-basic-multiple-validators example. */
export interface ExampleText {
    username: string;
    required: string;
    min5: string;
    max20: string;
    submit: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        username: 'Имя пользователя',
        required: 'Обязательно',
        min5: 'Минимум 5 символов',
        max20: 'Максимум 20 символов',
        submit: 'Отправить'
    },
    default: {
        username: 'Username',
        required: 'Required',
        min5: 'Minimum 5 characters',
        max20: 'Maximum 20 characters',
        submit: 'Submit'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

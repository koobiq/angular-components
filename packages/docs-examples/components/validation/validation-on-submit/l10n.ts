import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the validation-on-submit example. */
export interface ExampleText {
    name: string;
    lastName: string;
    submit: string;
    serverError: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        name: 'Имя',
        lastName: 'Фамилия',
        submit: 'Отправить',
        serverError: 'Сервер не ответил при отправке данных. Попробуйте ещё раз.'
    },
    default: {
        name: 'Name',
        lastName: 'Last name',
        submit: 'Submit',
        serverError: 'The server didn’t respond while sending data. Please try again.'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

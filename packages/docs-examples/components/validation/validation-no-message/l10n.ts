import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the validation-no-message example. */
export interface ExampleText {
    address: string;
    comment: string;
    submit: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        address: 'Адрес',
        comment: 'Комментарий',
        submit: 'Отправить'
    },
    default: {
        address: 'Address',
        comment: 'Comment',
        submit: 'Submit'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

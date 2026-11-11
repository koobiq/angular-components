import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the select-footer example. */
export interface ExampleText {
    button: string;
    caption: string;
    link: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        button: 'Кнопка',
        caption: 'Подпись',
        link: 'Ссылка'
    },
    default: {
        button: 'Button',
        caption: 'Caption',
        link: 'Link'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

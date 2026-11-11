import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the select-footer example. */
export interface ExampleText {
    optionN: (index: number) => string;
    button: string;
    caption: string;
    link: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        optionN: (index) => `Вариант №${index}`,
        button: 'Кнопка',
        caption: 'Подпись',
        link: 'Ссылка'
    },
    default: {
        optionN: (index) => `Option #${index}`,
        button: 'Button',
        caption: 'Caption',
        link: 'Link'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

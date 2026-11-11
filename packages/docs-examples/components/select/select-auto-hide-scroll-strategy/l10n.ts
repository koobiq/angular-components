import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the select-auto-hide-scroll-strategy example. */
export interface ExampleText {
    optionN: (index: number) => string;
    scrollDown: string;
    scrollUp: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        optionN: (index) => `Вариант №${index}`,
        scrollDown: 'Прокрутите вниз',
        scrollUp: 'Прокрутите вверх'
    },
    default: {
        optionN: (index) => `Option #${index}`,
        scrollDown: 'Scroll down',
        scrollUp: 'Scroll up'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

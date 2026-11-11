import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the select-auto-hide-scroll-strategy example. */
export interface ExampleText {
    scrollDown: string;
    scrollUp: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        scrollDown: 'Прокрутите вниз',
        scrollUp: 'Прокрутите вверх'
    },
    default: {
        scrollDown: 'Scroll down',
        scrollUp: 'Scroll up'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

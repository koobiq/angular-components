import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the popover-scrolling-and-layering-page example. */
export interface ExampleText {
    pageTitle: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        pageTitle: 'Заголовок страницы'
    },
    default: {
        pageTitle: 'Page Title'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

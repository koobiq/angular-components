import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the top-bar-title-counter-adaptive example. */
export interface ExampleText {
    pageHeader: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        pageHeader: 'Заголовок страницы'
    },
    default: {
        pageHeader: 'Page Header'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

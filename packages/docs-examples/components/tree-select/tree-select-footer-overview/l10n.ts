import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the footer-overview example. */
export interface ExampleText {
    link: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        link: 'Ссылка'
    },
    default: {
        link: 'Link'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-overview example. */
export interface ExampleText {
    headerText: string;
    link: string;
    linkN: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        headerText: 'Текст',
        link: 'Ссылка',
        linkN: (index) => `Ссылка ${index}`
    },
    default: {
        headerText: 'Text',
        link: 'Link',
        linkN: (index) => `Link ${index}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

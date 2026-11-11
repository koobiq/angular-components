import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-overview example. */
export interface ExampleText {
    headerText: string;
    text: (index: number) => string;
    link: string;
    linkN: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        headerText: 'Текст',
        text: (index) => `Текст ${index}`,
        link: 'Ссылка',
        linkN: (index) => `Ссылка ${index}`
    },
    default: {
        headerText: 'Text',
        text: (index) => `Text ${index}`,
        link: 'Link',
        linkN: (index) => `Link ${index}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

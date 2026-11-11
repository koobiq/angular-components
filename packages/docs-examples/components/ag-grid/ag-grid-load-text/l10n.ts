import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the load-text example. */
export interface ExampleText {
    loading: string;
    headerText: string;
    text: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        loading: 'Загрузка...',
        headerText: 'Текст',
        text: (index) => `Текст ${index}`
    },
    default: {
        loading: 'Loading...',
        headerText: 'Text',
        text: (index) => `Text ${index}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the inline-edit-unfilled example. */
export interface ExampleText {
    empty: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        empty: 'Пусто'
    },
    default: {
        empty: 'Empty'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

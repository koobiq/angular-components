import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the button-fill-and-style-only-icon example. */
export interface ExampleText {
    add: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        add: 'Добавить'
    },
    default: {
        add: 'Add'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

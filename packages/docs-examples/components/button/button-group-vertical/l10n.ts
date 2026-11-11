import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the button-group-vertical example. */
export interface ExampleText {
    minus: string;
    plus: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        minus: 'Минус',
        plus: 'Плюс'
    },
    default: {
        minus: 'Minus',
        plus: 'Plus'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

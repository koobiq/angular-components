import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the tooltip-hide-with-timeout example. */
export interface ExampleText {
    diamond: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        diamond: 'Ромб'
    },
    default: {
        diamond: 'Diamond'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

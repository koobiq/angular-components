import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the horizontal-form-labels example. */
export interface ExampleText {
    customFraction: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        customFraction: 'Произвольная (напр., 1/3 от ширины)'
    },
    default: {
        customFraction: 'Custom (e.g. 1/3 cols)'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

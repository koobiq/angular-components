import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the empty-state-text-only example. */
export interface ExampleText {
    noInfo: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        noInfo: 'Нет информации'
    },
    default: {
        noInfo: 'No information'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

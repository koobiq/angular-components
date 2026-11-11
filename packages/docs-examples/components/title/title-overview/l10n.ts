import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the title-overview example. */
export interface ExampleText {
    justText: string;
    andLongText: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        justText: 'Просто текст',
        andLongText: ' и длинный текст'
    },
    default: {
        justText: 'Just a text',
        andLongText: ' and a long text'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the select-two-line-option example. */
export interface ExampleText {
    twoLong1: string;
    twoLong2: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        twoLong1: 'Вариант №2 с очень длинной подписью, которая не помещается в одну строку панели',
        twoLong2:
            'Вариант №4 с ещё одной довольно длинной подписью, которая тоже должна переноситься на следующую строку'
    },
    default: {
        twoLong1: 'Option #2 with a very long label that does not fit on a single line of the panel',
        twoLong2: 'Option #4 with another quite long label that also has to wrap onto the next line'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

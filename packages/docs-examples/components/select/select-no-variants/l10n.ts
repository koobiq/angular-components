import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the select-no-variants example. */
export interface ExampleText {
    emptySelect: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        emptySelect: 'Пустой селект'
    },
    default: {
        emptySelect: 'Empty select'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

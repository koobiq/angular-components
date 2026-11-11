import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the autocomplete-with-footer example. */
export interface ExampleText {
    label: string;
    withFooterHint: string;
    link: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        label: 'Метка',
        withFooterHint: 'Автодополнение с футером',
        link: 'Ссылка'
    },
    default: {
        label: 'Label',
        withFooterHint: 'Autocomplete with footer',
        link: 'Link'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

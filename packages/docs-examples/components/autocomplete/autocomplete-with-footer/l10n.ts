import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the autocomplete-with-footer example. */
export interface ExampleText {
    label: string;
    withFooterHint: string;
    link: string;
    option: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        label: 'Метка',
        withFooterHint: 'Автодополнение с футером',
        link: 'Ссылка',
        option: (index) => `Вариант ${index}`
    },
    default: {
        label: 'Label',
        withFooterHint: 'Autocomplete with footer',
        link: 'Link',
        option: (index) => `Option ${index}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

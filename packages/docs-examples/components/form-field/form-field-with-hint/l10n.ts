import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the form-field-with-hint example. */
export interface ExampleText {
    articleTitle: string;
    maxChars: (max: number, count: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        articleTitle: 'Заголовок статьи',
        maxChars: (max, count) => `Максимум ${max} символов (${count}/${max})`
    },
    default: {
        articleTitle: 'Article title',
        maxChars: (max, count) => `Max ${max} chars (${count}/${max})`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

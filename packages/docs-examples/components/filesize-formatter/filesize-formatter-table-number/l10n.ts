import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the filesize-formatter-table-number example. */
export interface ExampleText {
    file: string;
    size: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        file: 'Файл',
        size: 'Размер'
    },
    default: {
        file: 'File',
        size: 'Size'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

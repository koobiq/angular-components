import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the filesize-formatter-table-number example. */
export interface ExampleText {
    file: string;
    size: string;
    fileN: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        file: 'Файл',
        size: 'Размер',
        fileN: (index) => `Файл ${index}`
    },
    default: {
        file: 'File',
        size: 'Size',
        fileN: (index) => `File ${index}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

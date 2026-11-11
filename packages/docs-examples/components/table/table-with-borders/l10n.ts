import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the table-with-borders example. */
export interface ExampleText {
    file: string;
    owner: string;
    modified: string;
    size: string;
    bigBook: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        file: 'Файл',
        owner: 'Владелец',
        modified: 'Изменён',
        size: 'Размер',
        bigBook: 'Большая книга стихов и сказок'
    },
    default: {
        file: 'File',
        owner: 'Owner',
        modified: 'Modified',
        size: 'Size',
        bigBook: 'The Big Book of Poems and Fairy Tales'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

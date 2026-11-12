import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the table-with-borders example. */
export interface ExampleText {
    file: string;
    owner: string;
    modified: string;
    size: string;
    bigBook: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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

import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the table examples. Dates and file names stay as-is. */
export interface ExampleText {
    file: string;
    owner: string;
    modified: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        file: 'Файл',
        owner: 'Владелец',
        modified: 'Изменён'
    },
    default: {
        file: 'File',
        owner: 'Owner',
        modified: 'Modified'
    }
};

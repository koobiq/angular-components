import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the filesize-formatter-table-number example. */
export interface ExampleText {
    file: string;
    size: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        file: 'Файл',
        size: 'Размер'
    },
    default: {
        file: 'File',
        size: 'Size'
    }
};

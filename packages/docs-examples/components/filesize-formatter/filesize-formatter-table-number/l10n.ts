import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the filesize-formatter-table-number example. */
export interface ExampleTranslation {
    file: string;
    size: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        file: 'Файл',
        size: 'Размер'
    },
    default: {
        file: 'File',
        size: 'Size'
    }
};

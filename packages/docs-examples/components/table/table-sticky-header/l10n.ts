import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the table examples. Dates and file names stay as-is. */
export interface ExampleTranslation {
    file: string;
    owner: string;
    modified: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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

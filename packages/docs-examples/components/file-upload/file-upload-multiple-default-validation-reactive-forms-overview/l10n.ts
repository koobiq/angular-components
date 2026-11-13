import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the file-upload examples. The custom-text examples keep their hardcoded per-locale data — demonstrating that API is their point. */
export interface ExampleTranslation {
    sizeNotExceed5mb: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        sizeNotExceed5mb: 'Размер файла не должен превышать 5 МБ'
    },
    default: {
        sizeNotExceed5mb: 'The file size should not exceed 5 MB'
    }
};

import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the file-upload examples. The custom-text examples keep their hardcoded per-locale data — demonstrating that API is their point. */
export interface ExampleTranslation {
    filesTxtAllowed: string;
    fileRequired: string;
    provideValidExtension: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        filesTxtAllowed: 'Разрешены файлы с расширением TXT',
        fileRequired: 'Файл обязателен',
        provideValidExtension: 'Укажите допустимое расширение'
    },
    default: {
        filesTxtAllowed: 'Files with TXT extension are allowed',
        fileRequired: 'File required',
        provideValidExtension: 'Provide valid extension'
    }
};

import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the file-upload examples. The custom-text examples keep their hardcoded per-locale data — demonstrating that API is their point. */
export interface ExampleText {
    fileRequired: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        fileRequired: 'Файл обязателен'
    },
    default: {
        fileRequired: 'File required'
    }
};

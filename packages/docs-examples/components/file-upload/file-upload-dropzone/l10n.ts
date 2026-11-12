import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the file-upload examples. The custom-text examples keep their hardcoded per-locale data — demonstrating that API is their point. */
export interface ExampleText {
    dropFilesHere: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        dropFilesHere: 'Перетащите файлы сюда'
    },
    default: {
        dropFilesHere: 'Drop files here'
    }
};

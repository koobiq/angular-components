import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the file-upload-single-async-validation example. */
export interface ExampleText {
    failedToRead: string;
    onlyTxtWithLines: (maxLines: number) => string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        failedToRead: 'Не удалось прочитать содержимое файла',
        onlyTxtWithLines: (maxLines) => `Разрешены только TXT-файлы до ${maxLines} строк`
    },
    default: {
        failedToRead: 'Failed to read file content',
        onlyTxtWithLines: (maxLines) => `Only TXT files with up to ${maxLines} lines are allowed`
    }
};

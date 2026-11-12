import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the file-upload-multiple-error-filled example. */
export interface ExampleText {
    provideValidExtension: string;
    noMoreThan1mb: string;
    sizeLimitExceeded: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        provideValidExtension: 'Укажите допустимое расширение',
        noMoreThan1mb: 'Не более 1 МБ',
        sizeLimitExceeded: 'Превышен лимит размера файла'
    },
    default: {
        provideValidExtension: 'Provide valid extension',
        noMoreThan1mb: 'No more than 1 MB',
        sizeLimitExceeded: 'The file size limit has been exceeded'
    }
};

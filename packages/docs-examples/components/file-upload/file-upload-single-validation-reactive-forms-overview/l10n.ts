import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the file-upload-single-validation-reactive-forms-overview example. */
export interface ExampleText {
    sizeNotExceed5mb: string;
    sizeMustNotExceed: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        sizeNotExceed5mb: 'Размер файла не должен превышать 5 МБ',
        sizeMustNotExceed: 'Размер файла не должен превышать лимит'
    },
    default: {
        sizeNotExceed5mb: 'The file size should not exceed 5 MB',
        sizeMustNotExceed: 'The file size must not exceed the limit'
    }
};

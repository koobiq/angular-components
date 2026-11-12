import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the file-upload-single-validation-reactive-forms-overview example. */
export interface ExampleTranslation {
    sizeNotExceed5mb: string;
    sizeMustNotExceed: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        sizeNotExceed5mb: 'Размер файла не должен превышать 5 МБ',
        sizeMustNotExceed: 'Размер файла не должен превышать лимит'
    },
    default: {
        sizeNotExceed5mb: 'The file size should not exceed 5 MB',
        sizeMustNotExceed: 'The file size must not exceed the limit'
    }
};

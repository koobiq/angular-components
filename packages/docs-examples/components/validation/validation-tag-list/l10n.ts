import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the validation-tag-list example. */
export interface ExampleTranslation {
    required: string;
    submit: string;
    onlyLatinLetters: string;
    invalidTags: string;
    newTag: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        required: 'Обязательно',
        submit: 'Отправить',
        onlyLatinLetters: 'Только латинские буквы',
        invalidTags: 'Недопустимые теги:',
        newTag: 'Новый тег...'
    },
    default: {
        required: 'Required',
        submit: 'Submit',
        onlyLatinLetters: 'Provide only latin letters',
        invalidTags: 'Invalid tags:',
        newTag: 'New tag...'
    }
};

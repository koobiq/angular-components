import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the validation-tag-list example. */
export interface ExampleText {
    required: string;
    submit: string;
    onlyLatinLetters: string;
    invalidTags: string;
    newTag: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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

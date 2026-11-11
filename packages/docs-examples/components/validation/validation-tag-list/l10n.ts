import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the validation-tag-list example. */
export interface ExampleText {
    required: string;
    onlyLatinLetters: string;
    invalidTags: string;
    submit: string;
    newTag: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        required: 'Обязательно',
        onlyLatinLetters: 'Только латинские буквы',
        invalidTags: 'Недопустимые теги:',
        submit: 'Отправить',
        newTag: 'Новый тег...'
    },
    default: {
        required: 'Required',
        onlyLatinLetters: 'Provide only latin letters',
        invalidTags: 'Invalid tags:',
        submit: 'Submit',
        newTag: 'New tag...'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the form field examples. */
export interface ExampleText {
    fieldName: string;
    hintBelowField: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        fieldName: 'Имя поля',
        hintBelowField: 'Подсказка под полем'
    },
    default: {
        fieldName: 'Field name',
        hintBelowField: 'Hint below the field'
    }
};

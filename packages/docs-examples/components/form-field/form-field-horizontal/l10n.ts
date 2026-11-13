import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the form field examples. */
export interface ExampleTranslation {
    fieldName: string;
    hintBelowField: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        fieldName: 'Имя поля',
        hintBelowField: 'Подсказка под полем'
    },
    default: {
        fieldName: 'Field name',
        hintBelowField: 'Hint below the field'
    }
};

import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the form-field-without-borders example. */
export interface ExampleTranslation {
    shouldEnterValue: string;
    formFieldWithoutBorders: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        shouldEnterValue: 'Введите значение',
        formFieldWithoutBorders: 'Поле без границ'
    },
    default: {
        shouldEnterValue: 'Should enter a value',
        formFieldWithoutBorders: 'Form field without borders'
    }
};

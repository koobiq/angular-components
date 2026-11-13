import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the datepicker examples. */
export interface ExampleTranslation {
    disabledEmptyField: string;
    readOnlyField: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        disabledEmptyField: 'Отключённое пустое поле',
        readOnlyField: 'Поле только для чтения с данными'
    },
    default: {
        disabledEmptyField: 'Disabled empty field',
        readOnlyField: 'Read-only field with data'
    }
};

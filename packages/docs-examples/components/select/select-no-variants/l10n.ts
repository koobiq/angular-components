import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the select-no-variants example. */
export interface ExampleTranslation {
    emptySelect: string;
    noOptions: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        emptySelect: 'Пустой селект',
        noOptions: 'Нет вариантов выбора'
    },
    default: {
        emptySelect: 'Empty select',
        noOptions: 'No options to select'
    }
};

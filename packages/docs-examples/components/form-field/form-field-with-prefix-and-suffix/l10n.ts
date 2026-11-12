import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the form-field-with-prefix-and-suffix example. */
export interface ExampleTranslation {
    search: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        search: 'Поиск'
    },
    default: {
        search: 'Search'
    }
};

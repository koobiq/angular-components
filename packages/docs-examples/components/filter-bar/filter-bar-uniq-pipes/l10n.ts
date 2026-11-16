import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shared by the filter-bar examples. */
export interface ExampleTranslation {
    /** The text search pipe: the first pipe in every filter, always present, never removable. */
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

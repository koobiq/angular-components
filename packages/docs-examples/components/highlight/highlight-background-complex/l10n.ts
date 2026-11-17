import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the highlight examples. Search demo data (Cube articles, clubs) stays English so the queries match. */
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

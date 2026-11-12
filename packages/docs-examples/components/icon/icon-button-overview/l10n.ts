import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the icon examples. Size and color names (Normal, Compact, Theme) stay English as API names. */
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

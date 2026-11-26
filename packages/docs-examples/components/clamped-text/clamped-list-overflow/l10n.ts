import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the overflow-based clamped-list example. */
export interface ExampleTranslation {
    countries: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        countries: [
            'Австралия',
            'Австрия',
            'Аргентина',
            'Бельгия',
            'Бразилия',
            'Великобритания',
            'Германия',
            'Греция',
            'Дания',
            'Египет',
            'Индия',
            'Испания',
            'Италия',
            'Канада',
            'Мексика',
            'Нидерланды',
            'Норвегия'
        ]
    },
    default: {
        countries: [
            'Australia',
            'Austria',
            'Argentina',
            'Belgium',
            'Brazil',
            'United Kingdom',
            'Germany',
            'Greece',
            'Denmark',
            'Egypt',
            'India',
            'Spain',
            'Italy',
            'Canada',
            'Mexico',
            'Netherlands',
            'Norway'
        ]
    }
};

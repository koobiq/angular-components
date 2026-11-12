import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the overflow-items examples. */
export interface ExampleTranslation {
    andMore: (count: number) => string;
    countries: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        andMore: (count) => `и ещё ${count}`,
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
            'Норвегия',
            'Польша',
            'Португалия',
            'Россия',
            'США',
            'Таиланд',
            'Турция',
            'Франция',
            'Япония'
        ]
    },
    default: {
        andMore: (count) => `and ${count} more`,
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
            'Norway',
            'Poland',
            'Portugal',
            'Russia',
            'United States',
            'Thailand',
            'Turkey',
            'France',
            'Japan'
        ]
    }
};

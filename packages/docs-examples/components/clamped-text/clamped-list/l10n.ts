import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the clamped-text examples. MITRE technique names in the list example stay English as proper names. */
export interface ExampleText {
    countries: string[];
}

export const TEXT: LocalizedText<ExampleText> = {
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

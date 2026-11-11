import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the overflow-items examples. */
export interface ExampleText {
    andMore: (count: number) => string;
    countries: string[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the flag examples. Fictional country names (Gondor, Wakanda) stay as-is. */
export interface ExampleText {
    selectCountry: string;
    selectLanguage: string;
    overviewCountries: string[];
    circleCountries: string[];
    fallbackCountries: string[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        selectCountry: 'Выберите страну',
        selectLanguage: 'Выберите язык',
        overviewCountries: [
            'Бразилия',
            'Болгария',
            'Индонезия',
            'Сен-Мартен',
            'Уругвай',
            'Майотта',
            'Пакистан',
            'Израиль',
            'Англия',
            'Финляндия',
            'Бельгия',
            'Кюрасао',
            'Южная Корея'
        ],
        circleCountries: ['Ангола', 'Малайзия', 'Уругвай'],
        fallbackCountries: ['Албания', 'Гондор', 'Кракозия', 'Перу', 'Ваканда']
    },
    default: {
        selectCountry: 'Select a country',
        selectLanguage: 'Select your language',
        overviewCountries: [
            'Brazil',
            'Bulgaria',
            'Indonesia',
            'Saint Martin',
            'Uruguay',
            'Mayotte',
            'Pakistan',
            'Israel',
            'England',
            'Finland',
            'Belgium',
            'Curaçao',
            'South Korea'
        ],
        circleCountries: ['Angola', 'Malaysia', 'Uruguay'],
        fallbackCountries: ['Albania', 'Gondor', 'Krakozhia', 'Peru', 'Wakanda']
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

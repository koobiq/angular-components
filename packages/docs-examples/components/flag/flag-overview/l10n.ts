import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the flag examples. Fictional country names (Gondor, Wakanda) stay as-is. */
export interface ExampleTranslation {
    overviewCountries: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
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
        ]
    },
    default: {
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
        ]
    }
};

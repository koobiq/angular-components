import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    locale: string;
    volume: string;
    price: string;
    currency: string;
    range: string;
    bounds: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        locale: 'ru-RU',
        volume: 'Громкость',
        price: 'Цена, ₽',
        currency: '₽',
        range: 'Диапазон цен',
        bounds: ['Минимальная цена', 'Максимальная цена']
    },
    'en-US': {
        locale: 'en-US',
        volume: 'Volume',
        price: 'Price, $',
        currency: '$',
        range: 'Price range',
        bounds: ['Minimum price', 'Maximum price']
    }
};

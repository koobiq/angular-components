import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    volume: string;
    price: string;
    currency: string;
    range: string;
    bounds: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        volume: 'Громкость, %',
        price: 'Цена',
        currency: '₽',
        range: 'Ценовой диапазон',
        bounds: ['Минимальная цена', 'Максимальная цена']
    },
    'en-US': {
        volume: 'Volume, %',
        price: 'Price',
        currency: '$',
        range: 'Price range',
        bounds: ['Minimum price', 'Maximum price']
    }
};

import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    volume: string;
    price: string;
    range: string;
    bounds: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        volume: 'Громкость',
        price: 'Цена, ₽',
        range: 'Диапазон цен',
        bounds: ['Минимальная цена', 'Максимальная цена']
    },
    'en-US': {
        volume: 'Volume',
        price: 'Price, $',
        range: 'Price range',
        bounds: ['Minimum price', 'Maximum price']
    }
};

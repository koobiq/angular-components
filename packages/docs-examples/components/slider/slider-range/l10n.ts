import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    behavior: string;
    price: string;
    currency: string;
    gap: string;
    bounds: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        behavior: 'Поведение при столкновении',
        price: 'Цена',
        currency: '₽',
        gap: 'Между границами остаётся не меньше 100 ₽.',
        bounds: ['Минимальная цена', 'Максимальная цена']
    },
    'en-US': {
        behavior: 'Thumb collision behavior',
        price: 'Price',
        currency: '$',
        gap: 'The bounds stay at least $100 apart.',
        bounds: ['Minimum price', 'Maximum price']
    }
};

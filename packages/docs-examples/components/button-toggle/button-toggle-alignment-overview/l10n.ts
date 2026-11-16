import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the button toggle examples. */
export interface ExampleTranslation {
    courier: string;
    donkeyExpress: string;
    middleEarthPost: string;
    deliveryMethod: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        courier: 'Курьером',
        donkeyExpress: 'Ослик Экспресс',
        middleEarthPost: 'Почтой Средиземья',
        deliveryMethod: 'Способ доставки'
    },
    default: {
        courier: 'Courier',
        donkeyExpress: 'Donkey Express',
        middleEarthPost: 'Middle-earth Post',
        deliveryMethod: 'Delivery method'
    }
};

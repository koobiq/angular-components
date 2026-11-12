import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the button toggle examples. */
export interface ExampleText {
    courier: string;
    donkeyExpress: string;
    middleEarthPost: string;
    deliveryMethod: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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

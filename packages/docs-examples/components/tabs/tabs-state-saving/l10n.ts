import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the state-saving example. */
export interface ExampleTranslation {
    delivery: string;
    payment: string;
    refund: string;
    tabContent: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        delivery: 'Доставка',
        payment: 'Оплата',
        refund: 'Возврат',
        tabContent: 'Данный текст используется для иллюстрации содержимого вкладки'
    },
    default: {
        delivery: 'Delivery',
        payment: 'Payment',
        refund: 'Refund',
        tabContent: 'This text illustrates the content of the tab'
    }
};

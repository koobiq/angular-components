import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the accordion-state-saving example. */
export interface ExampleText {
    content: string;
    delivery: string;
    payment: string;
    refund: string;
    resetSavedState: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        content: 'Данный текст используется для иллюстрации внутреннего содержимого секции аккордеона',
        delivery: 'Доставка',
        payment: 'Оплата',
        refund: 'Возврат',
        resetSavedState: 'Сбросить сохранённое состояние'
    },
    default: {
        content: 'This text illustrates the inner content of the accordion section',
        delivery: 'Delivery',
        payment: 'Payment',
        refund: 'Refund',
        resetSavedState: 'Reset saved state'
    }
};

import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the accordion-state-saving example. */
export interface ExampleText {
    content: string;
    delivery: string;
    payment: string;
    refund: string;
    resetSavedState: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

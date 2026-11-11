import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the state-saving example. */
export interface ExampleText {
    delivery: string;
    payment: string;
    refund: string;
    tabContent: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

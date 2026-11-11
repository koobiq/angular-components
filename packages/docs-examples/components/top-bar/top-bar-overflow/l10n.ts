import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the top-bar-overflow example. */
export interface ExampleText {
    page: string;
    description: string;
    status: string;
    additionalInformation: string;
    badge: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        page: 'Страница',
        description: 'Описание',
        status: 'Статус',
        additionalInformation: 'Дополнительная информация',
        badge: 'Бейдж'
    },
    default: {
        page: 'Page',
        description: 'Description',
        status: 'Status',
        additionalInformation: 'Additional Information',
        badge: 'Badge'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the breadcrumbs-truncate-by-abbrev-items example. */
export interface ExampleText {
    main: string;
    aes: string;
    reviews: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        main: 'Главная',
        aes: 'Стандарт расширенного шифрования',
        reviews: 'Обзоры'
    },
    default: {
        main: 'Main',
        aes: 'Advanced Encryption Standard',
        reviews: 'Reviews'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

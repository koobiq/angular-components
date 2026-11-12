import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the breadcrumbs-truncate-by-abbrev-items example. */
export interface ExampleText {
    main: string;
    aes: string;
    reviews: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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

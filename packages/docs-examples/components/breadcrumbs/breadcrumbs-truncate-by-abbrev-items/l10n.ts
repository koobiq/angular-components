import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the breadcrumbs-truncate-by-abbrev-items example. */
export interface ExampleTranslation {
    main: string;
    aes: string;
    reviews: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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

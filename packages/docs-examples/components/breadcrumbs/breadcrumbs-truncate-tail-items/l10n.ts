import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the breadcrumbs-truncate-tail-items example. */
export interface ExampleTranslation {
    main: string;
    users: string;
    reportNumber: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        main: 'Главная',
        users: 'Пользователи',
        reportNumber: 'Отчёт №123456789'
    },
    default: {
        main: 'Main',
        users: 'Users',
        reportNumber: 'Report №123456789'
    }
};

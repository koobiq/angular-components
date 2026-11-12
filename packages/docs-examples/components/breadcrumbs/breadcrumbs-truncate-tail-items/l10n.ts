import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the breadcrumbs-truncate-tail-items example. */
export interface ExampleText {
    main: string;
    users: string;
    reportNumber: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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

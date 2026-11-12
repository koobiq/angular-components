import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the breadcrumbs-truncate-center-items example. */
export interface ExampleText {
    users: string;
    groups: string;
    reportDated: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        users: 'Пользователи',
        groups: 'Группы',
        reportDated: 'Отчёт от 28.08.2018'
    },
    default: {
        users: 'Users',
        groups: 'Groups',
        reportDated: 'Report dated 28.08.2018'
    }
};

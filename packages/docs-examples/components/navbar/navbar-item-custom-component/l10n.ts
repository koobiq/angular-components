import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the navbar examples. */
export interface ExampleText {
    dashboards: string;
    notifications: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        dashboards: 'Дашборды',
        notifications: 'Уведомления'
    },
    default: {
        dashboards: 'Dashboards',
        notifications: 'Notifications'
    }
};

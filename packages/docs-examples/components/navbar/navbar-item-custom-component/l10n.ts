import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the navbar examples. */
export interface ExampleTranslation {
    dashboards: string;
    notifications: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        dashboards: 'Дашборды',
        notifications: 'Уведомления'
    },
    default: {
        dashboards: 'Dashboards',
        notifications: 'Notifications'
    }
};

import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the navbar examples. */
export interface ExampleTranslation {
    longAppName: string;
    dashboards: string;
    projects: string;
    newTask: string;
    notifications: string;
    administration: string;
    help: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        longAppName: 'Очень длинное название меню с переносом строки и усечением многоточием',
        dashboards: 'Дашборды',
        projects: 'Проекты',
        newTask: 'Новая задача',
        notifications: 'Уведомления',
        administration: 'Администрирование',
        help: 'Справка'
    },
    default: {
        longAppName: 'Super Long Menu Title with Line Wrap and Ellipsis Truncation',
        dashboards: 'Dashboards',
        projects: 'Projects',
        newTask: 'New task',
        notifications: 'Notifications',
        administration: 'Administration',
        help: 'Help'
    }
};

import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the navbar examples. */
export interface ExampleTranslation {
    longAppName: string;
    dashboards: string;
    tasks: string;
    newTask: string;
    profile: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        longAppName: 'Очень длинное название меню с переносом строки и усечением многоточием',
        dashboards: 'Дашборды',
        tasks: 'Задачи',
        newTask: 'Новая задача',
        profile: 'Профиль'
    },
    default: {
        longAppName: 'Super Long Menu Title with Line Wrap and Ellipsis Truncation',
        dashboards: 'Dashboards',
        tasks: 'Tasks',
        newTask: 'New task',
        profile: 'Profile'
    }
};

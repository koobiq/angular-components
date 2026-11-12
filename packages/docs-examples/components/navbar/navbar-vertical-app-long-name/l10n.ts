import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the navbar examples. */
export interface ExampleText {
    longAppName: string;
    dashboards: string;
    tasks: string;
    newTask: string;
    profile: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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

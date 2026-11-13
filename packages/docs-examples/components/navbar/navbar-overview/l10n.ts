import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the navbar examples. */
export interface ExampleTranslation {
    allApps: string;
    /** Applications listed in the "all apps" menu. */
    apps: string[];
    appName: string;
    dashboards: string;
    tasks: string;
    projects: string;
    newTask: string;
    notifications: string;
    administration: string;
    help: string;
    profile: string;
    taskStatuses: { open: string; inProgress: string; done: string; canceled: string };
    profileMenu: { settings: string; users: string; downloadApp: string; switchTenant: string; logOut: string };
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        allApps: 'Все приложения',
        apps: ['Управление пользователями', 'База знаний', 'Секретные заметки'],
        appName: 'Название приложения',
        dashboards: 'Дашборды',
        tasks: 'Задачи',
        projects: 'Проекты',
        newTask: 'Новая задача',
        notifications: 'Уведомления',
        administration: 'Администрирование',
        help: 'Справка',
        profile: 'Профиль',
        taskStatuses: { open: 'Открытые', inProgress: 'В работе', done: 'Выполненные', canceled: 'Отмененные' },
        profileMenu: {
            settings: 'Настройки',
            users: 'Пользователи',
            downloadApp: 'Скачать приложение',
            switchTenant: 'Сменить тенант',
            logOut: 'Выход'
        }
    },
    default: {
        allApps: 'All apps',
        apps: ['User Management', 'Knowledge Hub', 'Secret Notes'],
        appName: 'App name',
        dashboards: 'Dashboards',
        tasks: 'Tasks',
        projects: 'Projects',
        newTask: 'New task',
        notifications: 'Notifications',
        administration: 'Administration',
        help: 'Help',
        profile: 'Profile',
        taskStatuses: { open: 'Open', inProgress: 'In progress', done: 'Done', canceled: 'Canceled' },
        profileMenu: {
            settings: 'Settings',
            users: 'Users',
            downloadApp: 'Download app',
            switchTenant: 'Switch tenant',
            logOut: 'Log out'
        }
    }
};

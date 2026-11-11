import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the navbar examples. */
export interface ExampleText {
    allApps: string;
    /** Applications listed in the "all apps" menu. */
    apps: string[];
    appName: string;
    longAppName: string;
    dashboards: string;
    tasks: string;
    projects: string;
    newTask: string;
    documentation: string;
    more: string;
    point: (index: number) => string;
    notifications: string;
    administration: string;
    help: string;
    profile: string;
    taskStatuses: { open: string; inProgress: string; done: string; canceled: string };
    profileMenu: { settings: string; users: string; downloadApp: string; switchTenant: string; logOut: string };
    /** Placeholder text of the page next to the vertical navbar. */
    pageText: string[];
}

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> =>
    injectLocalizedText<ExampleText>({
        'ru-RU': {
            allApps: 'Все приложения',
            apps: ['Управление пользователями', 'База знаний', 'Секретные заметки'],
            appName: 'Название приложения',
            longAppName: 'Очень длинное название меню с переносом строки и усечением многоточием',
            dashboards: 'Дашборды',
            tasks: 'Задачи',
            projects: 'Проекты',
            newTask: 'Новая задача',
            documentation: 'Документация',
            more: 'Еще',
            point: (index) => `Пункт ${index}`,
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
            },
            pageText: [
                'Целое число в принципе поддерживает скачок функции. Полином отражает экспериментальный разрыв функции, что неудивительно. Интеграл от функции, имеющий конечный разрыв расточительно специфицирует предел функции, таким образом сбылась мечта идиота — утверждение полностью доказано. Интеграл Пуассона развивает интеграл Фурье. Неопределенный интеграл категорически соответствует расходящийся ряд. Не факт, что функция многих переменных по‑прежнему востребована.',
                'К тому же график функции усиливает тригонометрический интеграл по поверхности. Правда, некоторые специалисты отмечают, что неравенство Бернулли обуславливает действительный расходящийся ряд. Тем не менее, неопределенный интеграл раскручивает разрыв функции.',
                'Эпсилон окрестность привлекает интеграл по бесконечной области. Пустое подмножество, общеизвестно, допускает ряд Тейлора. Наибольшее и наименьшее значения функции недоказуемо. Вектор, не вдаваясь в подробности, осмысленно транслирует постулат. Ортогональный определитель упорядочивает линейно зависимый минимум. Интеграл от функции, обращающейся в бесконечность вдоль линии позитивно уравновешивает график функции.'
            ]
        },
        default: {
            allApps: 'All apps',
            apps: ['User Management', 'Knowledge Hub', 'Secret Notes'],
            appName: 'App name',
            longAppName: 'Super Long Menu Title with Line Wrap and Ellipsis Truncation',
            dashboards: 'Dashboards',
            tasks: 'Tasks',
            projects: 'Projects',
            newTask: 'New task',
            documentation: 'Documentation',
            more: 'More',
            point: (index) => `Point ${index}`,
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
            },
            pageText: [
                'An integer, in principle, supports a jump of the function. The polynomial reflects an experimental discontinuity of the function, which is not surprising. The integral of a function with a finite discontinuity wastefully specifies the limit of the function, and so the fool’s dream came true — the statement is fully proved. The Poisson integral develops the Fourier integral. The indefinite integral categorically corresponds to a divergent series. It is not a given that a function of several variables is still in demand.',
                'Besides, the graph of the function amplifies the trigonometric surface integral. True, some experts note that Bernoulli’s inequality determines a real divergent series. Nevertheless, the indefinite integral unwinds the discontinuity of the function.',
                'The epsilon neighborhood attracts the integral over an infinite domain. The empty subset, as is well known, admits a Taylor series. The greatest and least values of the function are unprovable. The vector, without going into detail, meaningfully translates the postulate. The orthogonal determinant orders a linearly dependent minimum. The integral of a function that goes to infinity along a line positively balances the graph of the function.'
            ]
        }
    });

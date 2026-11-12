import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the navbar examples. */
export interface ExampleText {
    allApps: string;
    /** Applications listed in the "all apps" menu. */
    apps: string[];
    dashboards: string;
    tasks: string;
    newTask: string;
    more: string;
    profile: string;
    /** Placeholder text of the page next to the vertical navbar. */
    pageText: string[];
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        allApps: 'Все приложения',
        apps: ['Управление пользователями', 'База знаний', 'Секретные заметки'],
        dashboards: 'Дашборды',
        tasks: 'Задачи',
        newTask: 'Новая задача',
        more: 'Еще',
        profile: 'Профиль',
        pageText: [
            'Целое число в принципе поддерживает скачок функции. Полином отражает экспериментальный разрыв функции, что неудивительно. Интеграл от функции, имеющий конечный разрыв расточительно специфицирует предел функции, таким образом сбылась мечта идиота — утверждение полностью доказано. Интеграл Пуассона развивает интеграл Фурье. Неопределенный интеграл категорически соответствует расходящийся ряд. Не факт, что функция многих переменных по‑прежнему востребована.',
            'К тому же график функции усиливает тригонометрический интеграл по поверхности. Правда, некоторые специалисты отмечают, что неравенство Бернулли обуславливает действительный расходящийся ряд. Тем не менее, неопределенный интеграл раскручивает разрыв функции.',
            'Эпсилон окрестность привлекает интеграл по бесконечной области. Пустое подмножество, общеизвестно, допускает ряд Тейлора. Наибольшее и наименьшее значения функции недоказуемо. Вектор, не вдаваясь в подробности, осмысленно транслирует постулат. Ортогональный определитель упорядочивает линейно зависимый минимум. Интеграл от функции, обращающейся в бесконечность вдоль линии позитивно уравновешивает график функции.'
        ]
    },
    default: {
        allApps: 'All apps',
        apps: ['User Management', 'Knowledge Hub', 'Secret Notes'],
        dashboards: 'Dashboards',
        tasks: 'Tasks',
        newTask: 'New task',
        more: 'More',
        profile: 'Profile',
        pageText: [
            'An integer, in principle, supports a jump of the function. The polynomial reflects an experimental discontinuity of the function, which is not surprising. The integral of a function with a finite discontinuity wastefully specifies the limit of the function, and so the fool’s dream came true — the statement is fully proved. The Poisson integral develops the Fourier integral. The indefinite integral categorically corresponds to a divergent series. It is not a given that a function of several variables is still in demand.',
            'Besides, the graph of the function amplifies the trigonometric surface integral. True, some experts note that Bernoulli’s inequality determines a real divergent series. Nevertheless, the indefinite integral unwinds the discontinuity of the function.',
            'The epsilon neighborhood attracts the integral over an infinite domain. The empty subset, as is well known, admits a Taylor series. The greatest and least values of the function are unprovable. The vector, without going into detail, meaningfully translates the postulate. The orthogonal determinant orders a linearly dependent minimum. The integral of a function that goes to infinity along a line positively balances the graph of the function.'
        ]
    }
};

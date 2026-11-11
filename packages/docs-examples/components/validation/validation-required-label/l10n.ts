import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Option lists of the required-label example. */
export interface ExampleText {
    reasons: { value: number; label: string }[];
    estimations: { value: number; label: string }[];

    name: string;
    lastName: string;
    patronymic: string;
    comment: string;
    email: string;
    estimation: string;
    requestReason: string;
    required: string;
    optional: string;
    submit: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        reasons: [
            { value: 1, label: 'Проблемы в воспитании' },
            { value: 2, label: 'Депрессия, тревожность, страхи' },
            { value: 3, label: 'Жизненные кризисы' },
            { value: 4, label: 'Низкая уверенность в себе' },
            { value: 5, label: 'Отношения' },
            { value: 6, label: 'Психосоматические заболевания' },
            { value: 7, label: 'Повторяющиеся неприятные ситуации' },
            { value: 8, label: 'Трудная жизненная ситуация' },
            { value: 9, label: 'Эмоциональные расстройства' },
            { value: 10, label: 'Другое' }
        ],
        estimations: [
            { value: 1, label: 'Плохо' },
            { value: 2, label: 'Удовлетворительно' },
            { value: 3, label: 'Хорошо' },
            { value: 4, label: 'Лучше всего' }
        ],
        name: 'Имя',
        lastName: 'Фамилия',
        patronymic: 'Отчество',
        comment: 'Комментарий',
        email: 'Эл. почта',
        estimation: 'Оценка',
        requestReason: 'Причина запроса',
        required: 'Обязательно',
        optional: 'Необязательно',
        submit: 'Отправить'
    },
    default: {
        reasons: [
            { value: 1, label: 'Parenting issues' },
            { value: 2, label: 'Depression, anxiety, fear' },
            { value: 3, label: 'Life crises' },
            { value: 4, label: 'Low self-confidence' },
            { value: 5, label: 'Relationships' },
            { value: 6, label: 'Psychosomatic illnesses' },
            { value: 7, label: 'Recurring unpleasant situations' },
            { value: 8, label: 'Difficult life situation' },
            { value: 9, label: 'Emotional disorders' },
            { value: 10, label: 'Other' }
        ],
        estimations: [
            { value: 1, label: 'Bad' },
            { value: 2, label: 'Satisfactory' },
            { value: 3, label: 'Good' },
            { value: 4, label: 'Best of all' }
        ],
        name: 'Name',
        lastName: 'Last name',
        patronymic: 'Patronymic',
        comment: 'Comment',
        email: 'Email',
        estimation: 'Estimation',
        requestReason: 'Request reason',
        required: 'Required',
        optional: 'Optional',
        submit: 'Submit'
    }
};

/** Option lists of the example in the active locale. */
export const injectOptionsText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the inline-edit-select-basic example. */
export interface ExampleText {
    status: string;
    statuses: string[];
    severities: string[];
    priority: string;
    notSpecified: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        status: 'Статус',
        statuses: ['Открыт', 'В работе', 'Решён', 'Закрыт'],
        severities: ['Критическая', 'Высокая', 'Средняя', 'Низкая'],
        priority: 'Приоритет',
        notSpecified: 'Не указано'
    },
    default: {
        status: 'Status',
        statuses: ['Open', 'In progress', 'Resolved', 'Closed'],
        severities: ['Critical', 'High', 'Medium', 'Low'],
        priority: 'Priority',
        notSpecified: 'Not specified'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

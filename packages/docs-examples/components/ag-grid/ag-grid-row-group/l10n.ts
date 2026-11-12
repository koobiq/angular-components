import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-row-group example. */
export interface ExampleText {
    severity: string;
    clearCollapsedState: string;
    clearSelectionState: string;
    category: string;
    categories: string[];
    severities: string[];
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        severity: 'Важность',
        clearCollapsedState: 'Очистить состояние свёрнутости',
        clearSelectionState: 'Очистить состояние выбора',
        category: 'Категория',
        categories: ['Подбор пароля', 'Сложная атака', 'DDoS', 'HIPS-алерт', 'IDS/IPS-алерт', 'XSS'],
        severities: ['Низкая', 'Средняя', 'Высокая', 'Критическая']
    },
    default: {
        severity: 'Severity',
        clearCollapsedState: 'Clear collapsed state',
        clearSelectionState: 'Clear selection state',
        category: 'Category',
        categories: ['BruteForce', 'Complex Attack', 'DDoS', 'HIPS alert', 'IDS/IPS Alert', 'XSS'],
        severities: ['Low', 'Medium', 'High', 'Critical']
    }
};

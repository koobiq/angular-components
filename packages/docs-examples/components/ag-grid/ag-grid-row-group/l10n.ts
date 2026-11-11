import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-row-group example. */
export interface ExampleText {
    clearCollapsedState: string;
    clearSelectionState: string;
    severity: string;
    category: string;
    categories: string[];
    severities: string[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        clearCollapsedState: 'Очистить состояние свёрнутости',
        clearSelectionState: 'Очистить состояние выбора',
        severity: 'Важность',
        category: 'Категория',
        categories: ['Подбор пароля', 'Сложная атака', 'DDoS', 'HIPS-алерт', 'IDS/IPS-алерт', 'XSS'],
        severities: ['Низкая', 'Средняя', 'Высокая', 'Критическая']
    },
    default: {
        clearCollapsedState: 'Clear collapsed state',
        clearSelectionState: 'Clear selection state',
        severity: 'Severity',
        category: 'Category',
        categories: ['BruteForce', 'Complex Attack', 'DDoS', 'HIPS alert', 'IDS/IPS Alert', 'XSS'],
        severities: ['Low', 'Medium', 'High', 'Critical']
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

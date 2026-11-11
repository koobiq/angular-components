import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-external-filter-state example. */
export interface ExampleText {
    text: (index: number) => string;
    column: (index: number) => string;
    externalFilter: string;
    filter: string;
    categories: string[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        text: (index) => `Текст ${index}`,
        column: (index) => `Колонка ${index}`,
        externalFilter: 'Внешний фильтр',
        filter: 'Фильтр',
        categories: ['Подбор пароля', 'Сложная атака', 'DDoS', 'HIPS-алерт', 'IDS/IPS-алерт', 'XSS']
    },
    default: {
        text: (index) => `Text ${index}`,
        column: (index) => `Column ${index}`,
        externalFilter: 'External filter',
        filter: 'Filter',
        categories: ['BruteForce', 'Complex Attack', 'DDoS', 'HIPS alert', 'IDS/IPS Alert', 'XSS']
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);

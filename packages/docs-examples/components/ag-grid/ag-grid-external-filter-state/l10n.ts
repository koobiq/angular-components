import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-external-filter-state example. */
export interface ExampleText {
    externalFilter: string;
    filter: string;
    categories: string[];
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        externalFilter: 'Внешний фильтр',
        filter: 'Фильтр',
        categories: ['Подбор пароля', 'Сложная атака', 'DDoS', 'HIPS-алерт', 'IDS/IPS-алерт', 'XSS']
    },
    default: {
        externalFilter: 'External filter',
        filter: 'Filter',
        categories: ['BruteForce', 'Complex Attack', 'DDoS', 'HIPS alert', 'IDS/IPS Alert', 'XSS']
    }
};

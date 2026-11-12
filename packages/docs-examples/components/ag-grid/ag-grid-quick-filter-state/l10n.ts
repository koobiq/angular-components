import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-quick-filter-state example. */
export interface ExampleText {
    quickFilter: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        quickFilter: 'Быстрый фильтр'
    },
    default: {
        quickFilter: 'Quick filter'
    }
};

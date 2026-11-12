import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-filter-state example. */
export interface ExampleText {
    resetFilterState: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        resetFilterState: 'Сбросить состояние фильтров'
    },
    default: {
        resetFilterState: 'Reset filter state'
    }
};
